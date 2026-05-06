import React, { useState } from "react";
import {
  X,
  Calendar,
  User,
  FileText,
  Check,
  X as XIcon,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

const LEAVE_TYPES = {
  ANNUAL: { label: "Nghỉ năm", color: "bg-green-100 text-green-800" },
  SICK: { label: "Nghỉ ốm", color: "bg-red-100 text-red-800" },
  PERSONAL: { label: "Nghỉ cá nhân", color: "bg-blue-100 text-blue-800" },
  MATERNITY: { label: "Nghỉ thai sản", color: "bg-purple-100 text-purple-800" },
  OTHER: { label: "Khác", color: "bg-gray-100 text-gray-800" },
};

const STATUS_TYPES = {
  PENDING: {
    label: "Chờ duyệt",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-800",
    icon: XIcon,
  },
};

export default function LeaveRequestDetail({
  request,
  onClose,
  onApprove,
  onReject,
  onCancel,
}) {
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(request._id, approvalNotes);
      setShowApproveForm(false);
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    setLoading(true);
    try {
      await onReject(request._id, rejectionReason, rejectionNotes);
      setShowRejectForm(false);
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onCancel(request._id);
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = STATUS_TYPES[request.status].icon;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Chi tiết yêu cầu nghỉ phép"
      maxW="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header với trạng thái */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${LEAVE_TYPES[request.leaveType].color}`}
            >
              {LEAVE_TYPES[request.leaveType].label}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${STATUS_TYPES[request.status].color}`}
            >
              <StatusIcon className="w-4 h-4 mr-1" />
              {STATUS_TYPES[request.status].label}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Tạo: {formatDateTime(request.createdAt)}
          </div>
        </div>

        {/* Thông tin người yêu cầu */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Thông tin người yêu cầu
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Họ tên:</span>{" "}
              {request.user?.displayName}
            </div>
            <div>
              <span className="font-medium">Phòng ban:</span>{" "}
              {request.user?.department || "N/A"}
            </div>
            <div>
              <span className="font-medium">Chức vụ:</span>{" "}
              {request.user?.position || "N/A"}
            </div>
          </div>
        </div>

        {/* Chi tiết nghỉ phép */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Chi tiết nghỉ phép
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Ngày bắt đầu:</span>
              <br />
              {formatDate(request.startDate)}
            </div>
            <div>
              <span className="font-medium">Ngày kết thúc:</span>
              <br />
              {formatDate(request.endDate)}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Số ngày nghỉ:</span>{" "}
              {request.daysCount} ngày
            </div>
          </div>
        </div>

        {/* Lý do và ghi chú */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Lý do nghỉ phép</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {request.reason}
            </p>
          </div>

          {request.notes && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Ghi chú bổ sung
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {request.notes}
              </p>
            </div>
          )}
        </div>

        {/* Thông tin phê duyệt */}
        {(request.status === "APPROVED" || request.status === "REJECTED") && (
          <div
            className={`rounded-lg p-4 ${request.status === "APPROVED" ? "bg-green-50" : "bg-red-50"}`}
          >
            <h3 className="font-medium text-gray-900 mb-3">Thông tin xử lý</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Người xử lý:</span>{" "}
                {request.approvedBy?.displayName || "N/A"}
              </div>
              <div>
                <span className="font-medium">Thời gian:</span>{" "}
                {request.approvedAt
                  ? formatDateTime(request.approvedAt)
                  : "N/A"}
              </div>
              {request.status === "REJECTED" && request.rejectionReason && (
                <div>
                  <span className="font-medium">Lý do từ chối:</span>
                  <p className="mt-1 text-red-700 bg-red-100 p-2 rounded">
                    {request.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form phê duyệt */}
        {showApproveForm && (
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-medium text-gray-900 mb-3">
              Phê duyệt yêu cầu
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú khi phê duyệt..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận phê duyệt"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowApproveForm(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Form từ chối */}
        {showRejectForm && (
          <div className="border rounded-lg p-4 bg-red-50">
            <h3 className="font-medium text-gray-900 mb-3">Từ chối yêu cầu</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Giải thích lý do từ chối..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú bổ sung (tùy chọn)
                </label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú bổ sung..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowRejectForm(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer với actions */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>

          {onCancel && request.status === "PENDING" && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {loading ? "Đang xử lý..." : "Hủy yêu cầu"}
            </Button>
          )}

          {onApprove && request.status === "PENDING" && (
            <Button
              onClick={() => setShowApproveForm(true)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Phê duyệt
            </Button>
          )}

          {onReject && request.status === "PENDING" && (
            <Button
              onClick={() => setShowRejectForm(true)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              Từ chối
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
