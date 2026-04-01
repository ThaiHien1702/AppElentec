import mongoose from "mongoose";
import AccessPolicyEntry from "../models/AccessPolicyEntry.js";

const normalizeValue = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

// Admin xem danh sách policy theo bộ lọc.
export const listAccessPolicies = async (req, res) => {
  try {
    const { type, policy, active } = req.query;
    const query = {};

    if (type) query.type = type;
    if (policy) query.policy = policy;
    if (typeof active !== "undefined") query.active = active === "true";

    const rows = await AccessPolicyEntry.find(query).sort({ updatedAt: -1 });
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách access policies", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Admin thêm/cập nhật policy (upsert theo type + value).
export const upsertAccessPolicy = async (req, res) => {
  try {
    const { type, value, policy, reason, active } = req.body;

    if (!type || !value || !policy) {
      return res.status(400).json({ message: "Thiếu type, value hoặc policy" });
    }

    if (!["ID_NUMBER", "PHONE", "VEHICLE_PLATE"].includes(type)) {
      return res.status(400).json({ message: "type không hợp lệ" });
    }

    if (!["BLOCK", "ALLOW"].includes(policy)) {
      return res.status(400).json({ message: "policy không hợp lệ" });
    }

    const normalized = normalizeValue(value);

    const doc = await AccessPolicyEntry.findOneAndUpdate(
      { type, value: normalized },
      {
        $set: {
          policy,
          reason,
          active: typeof active === "boolean" ? active : true,
          updatedBy: req.userId,
        },
        $setOnInsert: {
          type,
          value: normalized,
          createdBy: req.userId,
        },
      },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      message: "Lưu access policy thành công",
      policy: doc,
    });
  } catch (error) {
    console.error("Lỗi khi upsert access policy", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Admin bật/tắt policy nhanh.
export const toggleAccessPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const doc = await AccessPolicyEntry.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Policy không tồn tại" });
    }

    doc.active = !doc.active;
    doc.updatedBy = req.userId;
    await doc.save();

    return res.status(200).json({
      message: `Policy đã được ${doc.active ? "kích hoạt" : "vô hiệu hóa"}`,
      policy: doc,
    });
  } catch (error) {
    console.error("Lỗi khi toggle access policy", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
