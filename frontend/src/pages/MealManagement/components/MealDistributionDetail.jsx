import React from "react";
import { X, Check, CheckCircle, Clock, XCircle } from "lucide-react";

const MEAL_TIMES = { BREAKFAST: "Bữa sáng", LUNCH: "Bữa trưa", DINNER: "Bữa tối" };
const STATUS_MAP = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  SERVED: { label: "Đã phát", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", color: "bg-gray-100 text-gray-800", icon: XCircle },
};

const formatDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "-");
const formatDateTime = (v) => (v ? new Date(v).toLocaleString("vi-VN") : "-");
const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

export default function MealDistributionDetail({ distribution, onClose, onConfirm, onServe, onCancel }) {
  if (!distribution) return null;

  const status = STATUS_MAP[distribution.status] || {};
  const StatusIcon = status.icon || Clock;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Chi tiết xuất ăn</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${status.color}`}>
              <StatusIcon className="w-4 h-4 mr-1" /> {status.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Nhân viên</p>
              <p className="font-medium">{distribution.employee?.displayName || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Phòng ban</p>
              <p className="font-medium">{distribution.department || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Suất ăn</p>
              <p className="font-medium">{distribution.meal?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Danh mục</p>
              <p className="font-medium">{distribution.meal?.category || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Bữa ăn</p>
              <p className="font-medium">{MEAL_TIMES[distribution.mealTime] || distribution.mealTime}</p>
            </div>
            <div>
              <p className="text-gray-500">Ngày xuất ăn</p>
              <p className="font-medium">{formatDate(distribution.distributionDate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Số lượng</p>
              <p className="font-medium">{distribution.quantity}</p>
            </div>
            <div>
              <p className="text-gray-500">Tổng tiền</p>
              <p className="font-medium text-orange-600">{formatPrice(distribution.totalPrice)}</p>
            </div>
          </div>

          {distribution.notes && (
            <div>
              <p className="text-sm text-gray-500">Ghi chú</p>
              <p className="text-sm mt-1 bg-gray-50 p-3 rounded-md">{distribution.notes}</p>
            </div>
          )}

          {distribution.confirmedBy && (
            <div className="text-sm">
              <p className="text-gray-500">Xác nhận bởi: <span className="font-medium text-gray-800">{distribution.confirmedBy?.displayName}</span></p>
              <p className="text-gray-500">Lúc: {formatDateTime(distribution.confirmedAt)}</p>
            </div>
          )}

          <div className="text-xs text-gray-400">
            <p>Tạo lúc: {formatDateTime(distribution.createdAt)}</p>
            <p>Cập nhật: {formatDateTime(distribution.updatedAt)}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 p-6 border-t">
          {onConfirm && distribution.status === "PENDING" && (
            <button onClick={() => { onConfirm(distribution._id); onClose(); }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Xác nhận
            </button>
          )}
          {onServe && distribution.status === "CONFIRMED" && (
            <button onClick={() => { onServe(distribution._id); onClose(); }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Đã phát
            </button>
          )}
          {onCancel && distribution.status !== "SERVED" && distribution.status !== "CANCELLED" && (
            <button onClick={() => { onCancel(distribution._id); onClose(); }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Hủy
            </button>
          )}
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Đóng</button>
        </div>
      </div>
    </div>
  );
}
