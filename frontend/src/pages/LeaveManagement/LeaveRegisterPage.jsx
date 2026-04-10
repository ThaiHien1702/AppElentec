import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { leaveService } from "../../utils/leaveService";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Nghỉ năm" },
  { value: "SICK", label: "Nghỉ ốm" },
  { value: "PERSONAL", label: "Nghỉ cá nhân" },
  { value: "MATERNITY", label: "Nghỉ thai sản" },
  { value: "OTHER", label: "Khác" },
];

export default function LeaveRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = "Ngày bắt đầu không được là ngày trong quá khứ";
      }
      if (end < start) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }
    if (!formData.reason.trim()) {
      newErrors.reason = "Vui lòng nhập lý do nghỉ phép";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await leaveService.createLeaveRequest(formData);
      handleApiSuccess("Tạo yêu cầu nghỉ phép thành công");
      navigate("/leave");
    } catch (error) {
      handleApiError(error, "Không thể tạo yêu cầu nghỉ phép");
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/leave")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Đăng ký nghỉ phép</h1>
        <p className="text-gray-600 mt-2">
          Điền thông tin dưới đây để tạo yêu cầu nghỉ phép
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <FormField label="Loại nghỉ phép" required>
            <select
              value={formData.leaveType}
              onChange={(e) => handleChange("leaveType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Ngày bắt đầu" required error={errors.startDate}>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Ngày kết thúc" required error={errors.endDate}>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>

          {/* Days Count */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Tổng số ngày:</span>{" "}
                {calculateDays()} ngày
              </p>
            </div>
          )}

          {/* Reason */}
          <FormField label="Lý do nghỉ phép" required error={errors.reason}>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="Nhập lý do nghỉ phép..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          {/* Notes */}
          <FormField label="Ghi chú (tùy chọn)">
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Thêm ghi chú nếu cần..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Đang tạo..." : "Tạo yêu cầu"}
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/leave")}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Lưu ý:</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>
            • Yêu cầu nghỉ phép phải được tạo trước ít nhất 3 ngày làm việc
          </li>
          <li>• Ngày bắt đầu không thể là ngày trong quá khứ</li>
          <li>• Yêu cầu sẽ được gửi tới quản lý để phê duyệt</li>
          <li>• Bạn có thể hủy yêu cầu nếu nó vẫn ở trạng thái chờ duyệt</li>
        </ul>
      </div>
    </div>
  );
}
