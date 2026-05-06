import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

const REQUEST_TYPES = [
  { key: "GATE_ACCESS", label: "Ra/vào cổng" },
  { key: "LEAVE", label: "Nghỉ phép" },
  { key: "OVERTIME", label: "Làm thêm giờ" },
  { key: "EARLY_LATE", label: "Về sớm/muộn" },
  { key: "LUGGAGE", label: "Mang đồ đạc ra/vào" },
];

const initialForm = {
  requestType: "GATE_ACCESS",
  subjectType: "GUEST",
  visitorName: "",
  visitorPhone: "",
  visitorCompany: "",
  idType: "CCCD",
  idNumber: "",
  vehiclePlate: "",
  purpose: "",
  hostName: "",
  areaAllowed: "",
  expectedCheckInAt: "",
  expectedCheckOutAt: "",
  priority: "normal",
  safetyChecklistCompleted: false,
  safetyChecklistNote: "",
  leaveType: "",
  leaveReason: "",
  overtimeWork: "",
  earlyLateType: "EARLY",
  earlyLateReason: "",
  luggageItemName: "",
  luggageItemType: "",
  luggageQuantity: "1",
  luggageDescription: "",
};

const statusText = {
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CHECKED_IN: "Đã vào cổng",
  CHECKED_OUT: "Đã ra cổng",
  OVERDUE: "Quá giờ",
  CANCELLED: "Đã hủy",
};

const statusColor = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  CHECKED_IN: "bg-blue-100 text-blue-800",
  CHECKED_OUT: "bg-slate-200 text-slate-800",
  OVERDUE: "bg-orange-100 text-orange-800",
  CANCELLED: "bg-zinc-200 text-zinc-800",
};

const getRequestTypeLabel = (type) => {
  return REQUEST_TYPES.find((item) => item.key === type)?.label || "Đăng ký";
};

const VisitRequestForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const type = searchParams.get("type") || "GATE_ACCESS";
    if (REQUEST_TYPES.some((item) => item.key === type)) {
      setFormData((prev) => ({
        ...prev,
        requestType: type,
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const canSubmit = useMemo(() => {
    const baseFields =
      formData.visitorName &&
      formData.visitorPhone &&
      formData.idNumber &&
      formData.purpose &&
      formData.hostName &&
      formData.areaAllowed &&
      formData.expectedCheckInAt &&
      formData.expectedCheckOutAt;

    if (!baseFields) return false;
    if (formData.subjectType === "CONTRACTOR" && !formData.safetyChecklistCompleted) {
      return false;
    }

    if (formData.requestType === "LEAVE") {
      return formData.leaveType && formData.leaveReason;
    }

    if (formData.requestType === "OVERTIME") {
      return formData.overtimeWork;
    }

    if (formData.requestType === "EARLY_LATE") {
      return formData.earlyLateReason;
    }

    if (formData.requestType === "LUGGAGE") {
      return formData.luggageItemName && formData.luggageItemType;
    }

    return true;
  }, [formData]);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.VISITS);
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onRequestTypeChange = (type) => {
    setSearchParams({ type });
    setFormData((prev) => ({
      ...prev,
      requestType: type,
    }));
  };

  const buildPayload = () => {
    const payload = {
      requestType: formData.requestType,
      subjectType: formData.subjectType,
      requestDetails: {},
      visitorName: formData.visitorName,
      visitorPhone: formData.visitorPhone,
      visitorCompany: formData.visitorCompany,
      idType: formData.idType,
      idNumber: formData.idNumber,
      vehiclePlate: formData.vehiclePlate,
      priority: formData.priority,
      safetyChecklistCompleted: formData.safetyChecklistCompleted,
      safetyChecklistNote: formData.safetyChecklistNote,
      hostName: formData.hostName,
      expectedCheckInAt: formData.expectedCheckInAt,
      expectedCheckOutAt: formData.expectedCheckOutAt,
    };

    switch (formData.requestType) {
      case "LEAVE":
        payload.purpose = formData.purpose || `Nghỉ phép: ${formData.leaveType}`;
        payload.areaAllowed = formData.areaAllowed || formData.leaveType;
        payload.requestDetails = {
          leaveType: formData.leaveType,
          leaveReason: formData.leaveReason,
        };
        break;
      case "OVERTIME":
        payload.purpose = formData.purpose || "Yêu cầu làm thêm giờ";
        payload.areaAllowed = formData.areaAllowed || "Làm thêm giờ";
        payload.requestDetails = {
          overtimeWork: formData.overtimeWork,
        };
        break;
      case "EARLY_LATE":
        payload.purpose =
          formData.purpose ||
          `Yêu cầu ${formData.earlyLateType === "EARLY" ? "về sớm" : "đến muộn"}`;
        payload.areaAllowed = formData.areaAllowed || formData.earlyLateType;
        payload.requestDetails = {
          earlyLateType: formData.earlyLateType,
          earlyLateReason: formData.earlyLateReason,
        };
        break;
      case "LUGGAGE":
        payload.purpose =
          formData.purpose || `Mang đồ đạc ra/vào: ${formData.luggageItemName}`;
        payload.areaAllowed = formData.areaAllowed || "Hành lý";
        payload.requestDetails = {
          itemName: formData.luggageItemName,
          itemType: formData.luggageItemType,
          quantity: formData.luggageQuantity,
          description: formData.luggageDescription,
        };
        break;
      default:
        payload.purpose = formData.purpose;
        payload.areaAllowed = formData.areaAllowed;
        break;
    }

    return payload;
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng nhập đủ thông tin bắt buộc",
      );
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post(API_PATHS.VISITS, buildPayload());
      handleApiSuccess("Tạo yêu cầu thành công");
      setFormData(initialForm);
      setSearchParams({ type: formData.requestType });
      fetchMyRequests();
    } catch (error) {
      handleApiError(error, "Tạo yêu cầu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (id) => {
    try {
      await axiosInstance.post(API_PATHS.VISIT_CANCEL(id));
      handleApiSuccess("Hủy yêu cầu thành công");
      fetchMyRequests();
    } catch (error) {
      handleApiError(error, "Không thể hủy yêu cầu");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              {getRequestTypeLabel(formData.requestType)}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tạo yêu cầu {getRequestTypeLabel(formData.requestType).toLowerCase()}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {REQUEST_TYPES.map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() => onRequestTypeChange(item.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  formData.requestType === item.key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <form
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={onSubmit}
        >
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Người đăng ký *"
            name="visitorName"
            value={formData.visitorName}
            onChange={onChange}
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            name="subjectType"
            value={formData.subjectType}
            onChange={onChange}
          >
            <option value="EMPLOYEE">Nhân viên nội bộ</option>
            <option value="GUEST">Khách làm việc</option>
            <option value="CONTRACTOR">Nhà thầu</option>
            <option value="VEHICLE">Xe ra/vào</option>
          </select>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Số điện thoại *"
            name="visitorPhone"
            value={formData.visitorPhone}
            onChange={onChange}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Công ty / Đơn vị"
            name="visitorCompany"
            value={formData.visitorCompany}
            onChange={onChange}
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            name="idType"
            value={formData.idType}
            onChange={onChange}
          >
            <option value="CCCD">CCCD</option>
            <option value="Passport">Passport</option>
            <option value="Other">Khác</option>
          </select>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Số giấy tờ / Mã nhân viên *"
            name="idNumber"
            value={formData.idNumber}
            onChange={onChange}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Biển số xe"
            name="vehiclePlate"
            value={formData.vehiclePlate}
            onChange={onChange}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            placeholder={
              formData.requestType === "LEAVE"
                ? "Lý do nghỉ phép *"
                : formData.requestType === "OVERTIME"
                ? "Nội dung làm thêm giờ *"
                : formData.requestType === "EARLY_LATE"
                ? "Lý do về sớm / đến muộn *"
                : formData.requestType === "LUGGAGE"
                ? "Nội dung yêu cầu hành lý *"
                : "Mục đích đến *"
            }
            name="purpose"
            value={formData.purpose}
            onChange={onChange}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder={
              formData.requestType === "LEAVE"
                ? "Loại nghỉ phép *"
                : formData.requestType === "OVERTIME"
                ? "Loại tăng ca"
                : formData.requestType === "EARLY_LATE"
                ? "Loại yêu cầu *"
                : formData.requestType === "LUGGAGE"
                ? "Loại hành lý *"
                : "Loại đối tượng *"
            }
            name="areaAllowed"
            value={formData.areaAllowed}
            onChange={onChange}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Người duyệt / Phụ trách nội bộ *"
            name="hostName"
            value={formData.hostName}
            onChange={onChange}
          />
          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Thời gian bắt đầu *
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="datetime-local"
              name="expectedCheckInAt"
              value={formData.expectedCheckInAt}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Thời gian kết thúc *
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="datetime-local"
              name="expectedCheckOutAt"
              value={formData.expectedCheckOutAt}
              onChange={onChange}
            />
          </div>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            name="priority"
            value={formData.priority}
            onChange={onChange}
          >
            <option value="normal">Ưu tiên thường</option>
            <option value="urgent">Ưu tiên khẩn</option>
          </select>

          {formData.requestType === "LEAVE" ? (
            <div className="md:col-span-2 space-y-3">
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                name="leaveType"
                value={formData.leaveType}
                onChange={onChange}
              >
                <option value="">Chọn loại nghỉ phép</option>
                <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                <option value="Nghỉ ốm">Nghỉ ốm</option>
                <option value="Nghỉ việc riêng">Nghỉ việc riêng</option>
              </select>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={4}
                placeholder="Chi tiết lý do nghỉ phép *"
                name="leaveReason"
                value={formData.leaveReason}
                onChange={onChange}
              />
            </div>
          ) : null}

          {formData.requestType === "OVERTIME" ? (
            <div className="md:col-span-2 space-y-3">
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={4}
                placeholder="Nội dung công việc làm thêm *"
                name="overtimeWork"
                value={formData.overtimeWork}
                onChange={onChange}
              />
            </div>
          ) : null}

          {formData.requestType === "EARLY_LATE" ? (
            <div className="md:col-span-2 space-y-3">
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                name="earlyLateType"
                value={formData.earlyLateType}
                onChange={onChange}
              >
                <option value="EARLY">Về sớm</option>
                <option value="LATE">Đến muộn</option>
              </select>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={4}
                placeholder="Lý do về sớm / đến muộn *"
                name="earlyLateReason"
                value={formData.earlyLateReason}
                onChange={onChange}
              />
            </div>
          ) : null}

          {formData.requestType === "LUGGAGE" ? (
            <div className="md:col-span-2 space-y-3">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Tên đồ đạc *"
                name="luggageItemName"
                value={formData.luggageItemName}
                onChange={onChange}
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Loại đồ đạc *"
                name="luggageItemType"
                value={formData.luggageItemType}
                onChange={onChange}
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Số lượng"
                name="luggageQuantity"
                value={formData.luggageQuantity}
                onChange={onChange}
              />
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="Mô tả thêm (kích thước, giá trị,...)"
                name="luggageDescription"
                value={formData.luggageDescription}
                onChange={onChange}
              />
            </div>
          ) : null}

          {formData.subjectType === "CONTRACTOR" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm md:col-span-2">
              <label className="flex items-center gap-2 font-medium text-amber-900">
                <input
                  type="checkbox"
                  name="safetyChecklistCompleted"
                  checked={formData.safetyChecklistCompleted}
                  onChange={onChange}
                />
                Đã hoàn thành checklist an toàn bắt buộc
              </label>
              <input
                className="mt-2 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
                placeholder="Ghi chú checklist an toàn (nếu có)"
                name="safetyChecklistNote"
                value={formData.safetyChecklistNote}
                onChange={onChange}
              />
            </div>
          ) : null}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Đang gửi..." : "Tạo yêu cầu"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Yêu cầu gần đây
          </h2>
          <button
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={fetchMyRequests}
            type="button"
          >
            Tải lại
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có yêu cầu nào.</p>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 10).map((item) => (
              <article
                key={item._id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.requestCode}
                  </p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[item.status] || "bg-slate-100 text-slate-700"}`}
                  >
                    {statusText[item.status] || item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">
                  {item.visitorName}
                </p>
                <p className="text-xs text-slate-500">{item.purpose}</p>
                {item.rejectionReason ? (
                  <p className="mt-2 text-xs text-rose-600">
                    Lý do từ chối: {item.rejectionReason}
                  </p>
                ) : null}
                {item.status === "PENDING_APPROVAL" ? (
                  <button
                    className="mt-3 rounded-md border border-rose-300 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50"
                    onClick={() => cancelRequest(item._id)}
                    type="button"
                  >
                    Hủy yêu cầu
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VisitRequestForm;
