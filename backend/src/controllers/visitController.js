import mongoose from "mongoose";
import VisitRequest from "../models/VisitRequest.js";
import AccessPolicyEntry from "../models/AccessPolicyEntry.js";
import AuditLog from "../models/AuditLog.js";
import GateCard from "../models/GateCard.js";
import Luggage from "../models/Luggage.js";

// Sinh mã yêu cầu dạng REQ-YYYYMMDD-XXXX để dễ tra cứu tại cổng.
const generateRequestCode = () => {
  const now = new Date();
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${yyyymmdd}-${rand}`;
};

// Nhóm có quyền xử lý bước phê duyệt.
const isApproverRole = (role) => ["admin", "moderator"].includes(role);
// Nhóm có quyền thao tác nghiệp vụ tại cổng.
const isGateRole = (role) => ["admin", "moderator"].includes(role);

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const normalizeCardCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const extractVietnamNationalId = (rawValue) => {
  const text = String(rawValue || "").trim();
  if (!text) return null;

  if (/^\d{12}$/.test(text)) {
    return text;
  }

  const firstPipeSegment = text.split("|")[0]?.trim();
  if (/^\d{12}$/.test(firstPipeSegment)) {
    return firstPipeSegment;
  }

  const idMatch = text.match(/\b\d{12}\b/);
  return idMatch ? idMatch[0] : null;
};

const extractVietnamNationalIds = (rawValue) => {
  const text = String(rawValue || "").trim();
  if (!text) return [];

  const matches = text.match(/\b\d{12}\b/g) || [];
  return [...new Set(matches)];
};

const getExpectedVisitorIds = (visit) => {
  const mainId = String(visit.idNumber || "").trim();
  return mainId ? [mainId] : [];
};

const validateScannedCccdForVisit = (visit, cccdQrData, manualCccdInput) => {
  const scannedIds = extractVietnamNationalIds(cccdQrData);
  const manualIds = extractVietnamNationalIds(manualCccdInput);
  const providedIds = [...new Set([...scannedIds, ...manualIds])];

  if (providedIds.length === 0) {
    return {
      ok: false,
      statusCode: 400,
      message:
        "Bắt buộc quét QR CCCD hoặc nhập tay số CCCD khi check-in/check-out",
    };
  }

  const expectedIds = getExpectedVisitorIds(visit);
  const missingIds = expectedIds.filter((id) => !providedIds.includes(id));

  if (missingIds.length > 0) {
    return {
      ok: false,
      statusCode: 400,
      message:
        "CCCD cung cấp chưa đủ cho toàn bộ người trong phiếu, vui lòng quét hoặc nhập bổ sung",
    };
  }

  return { ok: true, scannedIds: providedIds };
};

const isValidPortraitDataUrl = (value) =>
  typeof value === "string" &&
  /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(value.trim());

const getOrCreateGateCard = async (cardCode) => {
  const normalizedCode = normalizeCardCode(cardCode);
  if (!normalizedCode) return null;

  let card = await GateCard.findOne({ cardCode: normalizedCode });
  if (!card) {
    card = await GateCard.create({ cardCode: normalizedCode });
  }
  return card;
};

const markGateCardInUse = async (cardCode, visitId) => {
  const card = await getOrCreateGateCard(cardCode);
  if (!card) {
    return { ok: false, statusCode: 400, message: "Mã thẻ không hợp lệ" };
  }

  if (card.status === "INACTIVE") {
    return {
      ok: false,
      statusCode: 400,
      message: `Thẻ ${card.cardCode} đang bị vô hiệu hóa`,
    };
  }

  if (
    card.status === "IN_USE" &&
    String(card.assignedVisit || "") !== String(visitId)
  ) {
    const assignedVisit = await VisitRequest.findById(
      card.assignedVisit,
    ).select("requestCode visitorName");
    return {
      ok: false,
      statusCode: 409,
      message: `Thẻ ${card.cardCode} đang gắn cho ${assignedVisit?.visitorName || "khách khác"}${assignedVisit?.requestCode ? ` (${assignedVisit.requestCode})` : ""}`,
    };
  }

  card.status = "IN_USE";
  card.assignedVisit = visitId;
  card.assignedAt = new Date();
  card.returnedAt = null;
  await card.save();

  return { ok: true, card };
};

const releaseGateCard = async (cardCode) => {
  const normalizedCode = normalizeCardCode(cardCode);
  if (!normalizedCode) return;

  await GateCard.updateOne(
    { cardCode: normalizedCode },
    {
      $set: {
        status: "AVAILABLE",
        assignedVisit: null,
        assignedAt: null,
        returnedAt: new Date(),
      },
    },
  );
};

export const getGateCards = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const cards = await GateCard.find()
      .sort({ cardCode: 1 })
      .populate("assignedVisit", "requestCode visitorName status");

    return res.status(200).json(cards);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thẻ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const registerGateCard = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const normalizedCode = normalizeCardCode(req.body?.cardCode);
    if (!normalizedCode) {
      return res.status(400).json({ message: "Vui lòng nhập mã thẻ" });
    }

    const existing = await GateCard.findOne({ cardCode: normalizedCode });
    if (existing) {
      return res.status(409).json({ message: "Mã thẻ đã tồn tại" });
    }

    const card = await GateCard.create({ cardCode: normalizedCode });
    return res.status(201).json({
      message: "Tạo thẻ thành công",
      card,
    });
  } catch (error) {
    console.error("Lỗi khi tạo thẻ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const toggleGateCardStatus = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const { cardCode } = req.body;
    const normalizedCode = normalizeCardCode(cardCode);
    if (!normalizedCode) {
      return res.status(400).json({ message: "Vui lòng nhập mã thẻ" });
    }

    const card = await GateCard.findOne({ cardCode: normalizedCode });
    if (!card) {
      return res.status(404).json({ message: "Không tìm thấy thẻ" });
    }

    if (card.status === "IN_USE") {
      return res.status(400).json({
        message: "Không thể đổi trạng thái khi thẻ đang được sử dụng",
      });
    }

    card.status = card.status === "INACTIVE" ? "AVAILABLE" : "INACTIVE";
    await card.save();

    return res.status(200).json({
      message:
        card.status === "INACTIVE"
          ? "Đã vô hiệu hóa thẻ"
          : "Đã kích hoạt lại thẻ",
      card,
    });
  } catch (error) {
    console.error("Lỗi khi đổi trạng thái thẻ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

const logAudit = async (req, action, entityType, entityId, metadata = {}) => {
  try {
    await AuditLog.create({
      actorId: req.userId,
      actorRole: req.userRole,
      action,
      entityType,
      entityId: String(entityId),
      metadata,
    });
  } catch (error) {
    console.error("Lỗi ghi audit log", error);
  }
};

const checkAccessPolicy = async ({ idNumber, visitorPhone, vehiclePlate }) => {
  const matches = [];

  if (idNumber?.trim()) {
    matches.push({ type: "ID_NUMBER", value: normalizeText(idNumber) });
  }
  if (visitorPhone?.trim()) {
    matches.push({ type: "PHONE", value: normalizeText(visitorPhone) });
  }
  if (vehiclePlate?.trim()) {
    matches.push({ type: "VEHICLE_PLATE", value: normalizeText(vehiclePlate) });
  }

  if (matches.length === 0) {
    return { blocked: false, matchedRules: [] };
  }

  const rules = await AccessPolicyEntry.find({
    active: true,
    $or: matches,
  }).sort({ createdAt: -1 });

  const blockedRule = rules.find((rule) => rule.policy === "BLOCK");
  return {
    blocked: Boolean(blockedRule),
    blockedRule,
    matchedRules: rules,
  };
};

// Requester tạo mới yêu cầu ra/vào.
export const createVisitRequest = async (req, res) => {
  try {
    const {
      subjectType,
      visitorName,
      visitorPhone,
      visitorCompany,
      idType,
      idNumber,
      vehiclePlate,
      purpose,
      hostName,
      areaAllowed,
      expectedCheckInAt,
      expectedCheckOutAt,
      priority,
      safetyChecklistCompleted,
      safetyChecklistNote,
    } = req.body;

    const normalizedSubjectType = (subjectType || "GUEST").toUpperCase();
    if (
      !["EMPLOYEE", "GUEST", "CONTRACTOR", "VEHICLE"].includes(
        normalizedSubjectType,
      )
    ) {
      return res.status(400).json({ message: "Loại đối tượng không hợp lệ" });
    }

    if (
      !visitorName ||
      !visitorPhone ||
      !idNumber ||
      !purpose ||
      !hostName ||
      !areaAllowed ||
      !expectedCheckInAt ||
      !expectedCheckOutAt
    ) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const checkIn = new Date(expectedCheckInAt);
    const checkOut = new Date(expectedCheckOutAt);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res
        .status(400)
        .json({ message: "Định dạng thời gian không hợp lệ" });
    }

    if (checkOut <= checkIn) {
      return res
        .status(400)
        .json({ message: "Giờ ra dự kiến phải sau giờ vào dự kiến" });
    }

    // Nhà thầu bắt buộc xác nhận checklist an toàn trước khi gửi duyệt.
    if (normalizedSubjectType === "CONTRACTOR" && !safetyChecklistCompleted) {
      return res.status(400).json({
        message: "Nhà thầu bắt buộc hoàn thành checklist an toàn",
      });
    }

    const policyResult = await checkAccessPolicy({
      idNumber,
      visitorPhone,
      vehiclePlate,
    });
    if (policyResult.blocked) {
      await logAudit(req, "VISIT_CREATE_BLOCKED", "VisitRequest", "N/A", {
        reason: policyResult.blockedRule?.reason,
        rule: policyResult.blockedRule,
      });
      return res.status(403).json({
        message: `Thông tin nằm trong danh sách chặn${policyResult.blockedRule?.reason ? `: ${policyResult.blockedRule.reason}` : ""}`,
      });
    }

    // Tránh trùng mã bằng cách generate lại nếu đã tồn tại.
    let requestCode = generateRequestCode();
    let existing = await VisitRequest.findOne({ requestCode });
    while (existing) {
      requestCode = generateRequestCode();
      existing = await VisitRequest.findOne({ requestCode });
    }

    const visit = await VisitRequest.create({
      requestCode,
      subjectType: normalizedSubjectType,
      visitorName,
      visitorPhone,
      visitorCompany,
      idType,
      idNumber,
      vehiclePlate,
      purpose,
      hostName,
      areaAllowed,
      expectedCheckInAt: checkIn,
      expectedCheckOutAt: checkOut,
      priority,
      safetyChecklistCompleted: Boolean(safetyChecklistCompleted),
      safetyChecklistNote,
      requestedBy: req.userId,
    });

    await logAudit(req, "VISIT_CREATED", "VisitRequest", visit._id, {
      requestCode: visit.requestCode,
      subjectType: visit.subjectType,
    });

    return res.status(201).json({
      message: "Tạo yêu cầu ra/vào thành công",
      visit,
    });
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu ra/vào", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMyVisitRequests = async (req, res) => {
  try {
    // Moderator/Admin xem toàn bộ, user thường chỉ xem hồ sơ của chính họ.
    const query = isApproverRole(req.userRole)
      ? {}
      : { requestedBy: new mongoose.Types.ObjectId(req.userId) };

    const visits = await VisitRequest.find(query)
      .sort({ createdAt: -1 })
      .populate("requestedBy", "displayName idCompanny department")
      .populate("approvedBy", "displayName idCompanny")
      .populate("rejectedBy", "displayName idCompanny");

    return res.status(200).json(visits);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const cancelVisitRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
    }

    const visit = await VisitRequest.findById(id);
    if (!visit) {
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });
    }

    // Chỉ chủ sở hữu hồ sơ hoặc nhóm có quyền phê duyệt mới được hủy.
    const isOwner = visit.requestedBy.toString() === req.userId;
    if (!isOwner && !isApproverRole(req.userRole)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền hủy yêu cầu này" });
    }

    // Không cho hủy hồ sơ đã đi vào bước vận hành cổng.
    if (["CHECKED_IN", "CHECKED_OUT", "CANCELLED"].includes(visit.status)) {
      return res
        .status(400)
        .json({ message: "Không thể hủy yêu cầu ở trạng thái hiện tại" });
    }

    visit.status = "CANCELLED";
    await visit.save();

    return res.status(200).json({
      message: "Hủy yêu cầu thành công",
      visit,
    });
  } catch (error) {
    console.error("Lỗi khi hủy yêu cầu", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getApprovalInbox = async (req, res) => {
  try {
    if (!isApproverRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    // Inbox chỉ lấy hồ sơ đang chờ duyệt, sort cũ -> mới để xử lý theo hàng đợi.
    const pendingRequests = await VisitRequest.find({
      status: "PENDING_APPROVAL",
    })
      .sort({ createdAt: 1 })
      .populate("requestedBy", "displayName idCompanny department position");

    return res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Lỗi khi lấy inbox phê duyệt", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const approveVisitRequest = async (req, res) => {
  try {
    if (!isApproverRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
    }

    const visit = await VisitRequest.findById(requestId);

    if (!visit) {
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });
    }

    if (visit.status !== "PENDING_APPROVAL") {
      return res.status(400).json({
        message: "Chỉ có thể duyệt yêu cầu đang chờ phê duyệt",
      });
    }

    if (visit.subjectType === "CONTRACTOR" && !visit.safetyChecklistCompleted) {
      return res.status(400).json({
        message: "Nhà thầu chưa hoàn thành checklist an toàn",
      });
    }

    // Khi duyệt thành công, phát hành QR token để bảo vệ tra cứu nhanh.
    visit.status = "APPROVED";
    visit.approvedBy = req.userId;
    visit.approvedAt = new Date();
    visit.qrToken = visit.requestCode;
    visit.qrExpiresAt = new Date(visit.expectedCheckOutAt);
    visit.rejectionReason = undefined;
    await visit.save();

    await logAudit(req, "VISIT_APPROVED", "VisitRequest", visit._id, {
      requestCode: visit.requestCode,
    });

    return res.status(200).json({
      message: "Phê duyệt yêu cầu thành công",
      visit,
    });
  } catch (error) {
    console.error("Lỗi khi phê duyệt yêu cầu", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const rejectVisitRequest = async (req, res) => {
  try {
    if (!isApproverRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const { requestId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
    }

    // Lý do từ chối là bắt buộc để đáp ứng yêu cầu audit theo SOP.
    if (!reason?.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
    }

    const visit = await VisitRequest.findById(requestId);

    if (!visit) {
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });
    }

    if (visit.status !== "PENDING_APPROVAL") {
      return res.status(400).json({
        message: "Chỉ có thể từ chối yêu cầu đang chờ phê duyệt",
      });
    }

    visit.status = "REJECTED";
    visit.rejectionReason = reason.trim();
    visit.rejectedBy = req.userId;
    visit.rejectedAt = new Date();
    await visit.save();

    await logAudit(req, "VISIT_REJECTED", "VisitRequest", visit._id, {
      reason: visit.rejectionReason,
    });

    return res.status(200).json({
      message: "Từ chối yêu cầu thành công",
      visit,
    });
  } catch (error) {
    console.error("Lỗi khi từ chối yêu cầu", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const verifyVisitQr = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    // Hỗ trợ tìm theo qrCode hoặc requestCode để tiện cho vận hành thực tế.
    const { qrCode, requestCode, idNumber, cccdQrData } = req.body;
    const lookupCode = (qrCode || requestCode || cccdQrData || "").trim();
    const normalizedLookupCode = normalizeCardCode(lookupCode);
    const cccdFromQr = extractVietnamNationalId(lookupCode);

    if (!lookupCode) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mã QR hoặc mã yêu cầu" });
    }

    // Ưu tiên tra cứu theo mã thẻ đang được gắn cho khách trong cổng.
    let visit = await VisitRequest.findOne({
      status: { $in: ["CHECKED_IN", "OVERDUE"] },
      gateCardCode: normalizedLookupCode,
    }).populate("requestedBy", "displayName idCompanny department");

    if (!visit) {
      visit = await VisitRequest.findOne({
        $or: [{ qrToken: lookupCode }, { requestCode: lookupCode }],
      }).populate("requestedBy", "displayName idCompanny department");
    }

    // Fallback: hỗ trợ quét QR CCCD Việt Nam để tra cứu bằng số định danh.
    if (!visit && cccdFromQr) {
      visit = await VisitRequest.findOne({
        status: {
          $in: ["PENDING_APPROVAL", "APPROVED", "CHECKED_IN", "OVERDUE"],
        },
        idNumber: cccdFromQr,
      })
        .sort({ createdAt: -1 })
        .populate("requestedBy", "displayName idCompanny department");
    }

    if (!visit) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu phù hợp" });
    }

    // Nếu người dùng nhập số giấy tờ thì kiểm tra đối chiếu danh tính.
    if (idNumber?.trim()) {
      const normalizedInputId = idNumber.trim();
      const matchesMain = visit.idNumber === normalizedInputId;

      if (!matchesMain) {
        return res.status(400).json({ message: "Số giấy tờ không khớp" });
      }
    }

    if (visit.qrExpiresAt && new Date() > visit.qrExpiresAt) {
      return res.status(400).json({ message: "Mã QR đã hết hạn" });
    }

    const policyResult = await checkAccessPolicy({
      idNumber: visit.idNumber,
      visitorPhone: visit.visitorPhone,
      vehiclePlate: visit.vehiclePlate,
    });
    if (policyResult.blocked) {
      await logAudit(req, "VISIT_VERIFY_BLOCKED", "VisitRequest", visit._id, {
        reason: policyResult.blockedRule?.reason,
        rule: policyResult.blockedRule,
      });
      return res.status(403).json({
        message: `Yêu cầu bị chặn theo chính sách${policyResult.blockedRule?.reason ? `: ${policyResult.blockedRule.reason}` : ""}`,
      });
    }

    // Tự động đánh dấu OVERDUE khi khách đã vào nhưng quá giờ dự kiến.
    if (
      visit.status === "CHECKED_IN" &&
      new Date() > visit.expectedCheckOutAt
    ) {
      visit.status = "OVERDUE";
      await visit.save();
    }

    return res.status(200).json({
      message: "Xác minh thành công",
      visit,
    });
  } catch (error) {
    console.error("Lỗi khi xác minh QR", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const gateCheckIn = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const {
      visitId,
      qrCode,
      requestCode,
      gateCardCode,
      cccdQrData,
      manualCccdInput,
      portraitImageData,
    } = req.body;
    const lookupCode = (qrCode || requestCode || "").trim();
    const normalizedGateCardCode = normalizeCardCode(gateCardCode);

    // Ưu tiên tìm bằng visitId, fallback sang qrCode/requestCode.
    let visit = null;
    if (visitId && mongoose.Types.ObjectId.isValid(visitId)) {
      visit = await VisitRequest.findById(visitId);
    } else if (lookupCode) {
      visit = await VisitRequest.findOne({
        $or: [{ qrToken: lookupCode }, { requestCode: lookupCode }],
      });
    }

    if (!visit) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    const cccdValidation = validateScannedCccdForVisit(
      visit,
      cccdQrData,
      manualCccdInput,
    );
    if (!cccdValidation.ok) {
      return res
        .status(cccdValidation.statusCode)
        .json({ message: cccdValidation.message });
    }

    if (!normalizedGateCardCode) {
      return res.status(400).json({
        message: "Vui lòng nhập mã thẻ QR cố định để gắn khi check-in",
      });
    }

    if (!isValidPortraitDataUrl(portraitImageData)) {
      return res.status(400).json({
        message: "Bắt buộc chụp ảnh chân dung khách trước khi check-in",
      });
    }

    // Idempotent: nếu đã check-in rồi thì trả thành công, không cập nhật lại.
    if (visit.status === "CHECKED_IN") {
      if (visit.gateCardCode !== normalizedGateCardCode) {
        return res.status(409).json({
          message: "Yêu cầu đã check-in bằng thẻ khác",
        });
      }
      return res.status(200).json({
        message: "Yêu cầu đã check-in trước đó",
        visit,
      });
    }

    // Nếu đã hoàn tất check-out thì coi như không thể check-in lại.
    if (visit.status === "CHECKED_OUT") {
      return res.status(400).json({
        message: "Yêu cầu đã check-out, không thể check-in lại",
      });
    }

    // Chỉ cho check-in sau khi hồ sơ đã được duyệt.
    if (visit.status !== "APPROVED") {
      return res.status(400).json({
        message: "Chỉ yêu cầu đã duyệt mới được check-in",
      });
    }

    if (visit.qrExpiresAt && new Date() > visit.qrExpiresAt) {
      return res.status(400).json({ message: "Mã QR đã hết hạn" });
    }

    const policyResult = await checkAccessPolicy({
      idNumber: visit.idNumber,
      visitorPhone: visit.visitorPhone,
      vehiclePlate: visit.vehiclePlate,
    });
    if (policyResult.blocked) {
      await logAudit(req, "VISIT_CHECKIN_BLOCKED", "VisitRequest", visit._id, {
        reason: policyResult.blockedRule?.reason,
        rule: policyResult.blockedRule,
      });
      return res.status(403).json({
        message: `Không thể check-in do chính sách chặn${policyResult.blockedRule?.reason ? `: ${policyResult.blockedRule.reason}` : ""}`,
      });
    }

    const cardAssignment = await markGateCardInUse(
      normalizedGateCardCode,
      visit._id,
    );
    if (!cardAssignment.ok) {
      return res
        .status(cardAssignment.statusCode)
        .json({ message: cardAssignment.message });
    }

    visit.status = "CHECKED_IN";
    visit.checkInAt = new Date();
    visit.gateCardCode = normalizedGateCardCode;
    visit.gateCardAssignedAt = new Date();
    visit.gateCardReturnedAt = null;
    visit.portraitImageData = String(portraitImageData).trim();
    visit.portraitCapturedAt = new Date();
    await visit.save();

    await logAudit(req, "VISIT_CHECKED_IN", "VisitRequest", visit._id, {
      requestCode: visit.requestCode,
    });

    return res.status(200).json({
      message: "Check-in thành công",
      visit,
    });
  } catch (error) {
    console.error("Lỗi khi check-in", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const gateCheckOut = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const {
      visitId,
      qrCode,
      requestCode,
      checkoutCardQrCode,
      cccdQrData,
      manualCccdInput,
    } = req.body;
    const normalizedLookupCode = normalizeCardCode(
      checkoutCardQrCode || qrCode || requestCode,
    );

    if (!normalizedLookupCode) {
      return res.status(400).json({
        message: "Bắt buộc quét QR thẻ khách khi check-out",
      });
    }

    let visit = null;
    visit = await VisitRequest.findOne({
      status: { $in: ["CHECKED_IN", "OVERDUE", "CHECKED_OUT"] },
      gateCardCode: normalizedLookupCode,
    });

    if (!visit && visitId && mongoose.Types.ObjectId.isValid(visitId)) {
      const visitById = await VisitRequest.findById(visitId);
      if (visitById) {
        if (
          normalizeCardCode(visitById.gateCardCode) !== normalizedLookupCode
        ) {
          return res.status(400).json({
            message: "Mã QR thẻ không khớp với thông tin khách đã xác minh",
          });
        }
        visit = visitById;
      }
    }

    if (!visit) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    const cccdValidation = validateScannedCccdForVisit(
      visit,
      cccdQrData,
      manualCccdInput,
    );
    if (!cccdValidation.ok) {
      return res
        .status(cccdValidation.statusCode)
        .json({ message: cccdValidation.message });
    }

    // Idempotent: nếu đã check-out rồi thì trả thành công, không cập nhật lại.
    if (visit.status === "CHECKED_OUT") {
      await releaseGateCard(visit.gateCardCode);
      return res.status(200).json({
        message: "Yêu cầu đã check-out trước đó",
        visit,
      });
    }

    // Check-out hợp lệ khi trạng thái hiện tại là CHECKED_IN hoặc OVERDUE.
    if (!["CHECKED_IN", "OVERDUE"].includes(visit.status)) {
      return res.status(400).json({
        message: "Chỉ yêu cầu đã check-in mới được check-out",
      });
    }

    visit.status = "CHECKED_OUT";
    visit.checkOutAt = new Date();
    visit.gateCardReturnedAt = new Date();
    await visit.save();
    await releaseGateCard(visit.gateCardCode);

    await logAudit(req, "VISIT_CHECKED_OUT", "VisitRequest", visit._id, {
      requestCode: visit.requestCode,
    });

    return res.status(200).json({
      message: "Check-out thành công",
      visit,
    });
  } catch (error) {
    console.error("Lỗi khi check-out", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const gateManualDeny = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const { visitId, requestCode, reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
    }

    let visit = null;
    if (visitId && mongoose.Types.ObjectId.isValid(visitId)) {
      visit = await VisitRequest.findById(visitId);
    } else if (requestCode?.trim()) {
      visit = await VisitRequest.findOne({ requestCode: requestCode.trim() });
    }

    if (!visit) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    // Manual deny dùng để lưu dấu vết xử lý ngoại lệ tại cổng (FM-02).
    visit.deniedLogs = [
      ...(visit.deniedLogs || []),
      {
        reason: reason.trim(),
        handledBy: req.userId,
        deniedAt: new Date(),
      },
    ];
    await visit.save();

    await logAudit(req, "VISIT_MANUAL_DENY", "VisitRequest", visit._id, {
      reason: reason.trim(),
    });

    return res.status(200).json({
      message: "Đã ghi nhận từ chối thủ công",
      visit,
    });
  } catch (error) {
    console.error("Lỗi khi ghi nhận từ chối thủ công", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Lấy chi tiết yêu cầu ra/vào với danh sách hành lý
 */
export const getVisitDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
    }

    const visit = await VisitRequest.findById(id)
      .populate("requestedBy", "displayName idCompanny department")
      .populate("approvedBy", "displayName idCompanny")
      .populate("rejectedBy", "displayName idCompanny");

    if (!visit) {
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });
    }

    // Lấy danh sách hành lý
    const luggage = await Luggage.find({ visitRequest: id })
      .populate("checkedInBy", "displayName idCompanny")
      .populate("checkedOutBy", "displayName idCompanny")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      visit,
      luggage,
      luggageCount: luggage.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết yêu cầu", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
