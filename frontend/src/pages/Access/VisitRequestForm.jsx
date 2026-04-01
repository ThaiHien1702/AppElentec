import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

const initialForm = {
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

const VisitRequestForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const canSubmit = useMemo(() => {
    return (
      formData.visitorName &&
      formData.visitorPhone &&
      formData.idNumber &&
      formData.purpose &&
      formData.hostName &&
      formData.areaAllowed &&
      formData.expectedCheckInAt &&
      formData.expectedCheckOutAt &&
      (formData.subjectType !== "CONTRACTOR" ||
        formData.safetyChecklistCompleted)
    );
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

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      await axiosInstance.post(API_PATHS.VISITS, formData);
      handleApiSuccess("Tạo yêu cầu thành công");
      setFormData(initialForm);
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
        <h1 className="text-xl font-semibold text-slate-800">
          Đăng ký ra/vào cổng
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Requester tạo yêu cầu đầy đủ thông tin để gửi duyệt.
        </p>

        <form
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={onSubmit}
        >
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Họ tên khách *"
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
            <option value="GUEST">Khách làm việc</option>
            <option value="EMPLOYEE">Nhân viên nội bộ</option>
            <option value="CONTRACTOR">Nhà thầu/đối tác thi công</option>
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
            placeholder="Công ty/Đơn vị"
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
            placeholder="Số giấy tờ *"
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
            placeholder="Mục đích đến *"
            name="purpose"
            value={formData.purpose}
            onChange={onChange}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Người phụ trách nội bộ *"
            name="hostName"
            value={formData.hostName}
            onChange={onChange}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Khu vực được phép vào *"
            name="areaAllowed"
            value={formData.areaAllowed}
            onChange={onChange}
          />
          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Giờ vào dự kiến *
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
              Giờ ra dự kiến *
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
