import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { FormField } from "../../../components/ui/FormField";

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Nghỉ năm" },
  { value: "SICK", label: "Nghỉ ốm" },
  { value: "PERSONAL", label: "Nghỉ cá nhân" },
  { value: "MATERNITY", label: "Nghỉ thai sản" },
  { value: "OTHER", label: "Khác" },
];

export default function LeaveRequestForm({ onSubmit, onClose }) {
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
      await onSubmit(formData);
    } catch (error) {
      // Error is handled by parent component
      console.error("Failed to submit leave request:", error);
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
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Tạo yêu cầu nghỉ phép"
      maxW="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
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

        {formData.startDate && formData.endDate && (
          <div className="text-sm text-gray-600">
            Số ngày nghỉ:{" "}
            <span className="font-semibold">{calculateDays()} ngày</span>
          </div>
        )}

        <FormField label="Lý do nghỉ phép" required error={errors.reason}>
          <textarea
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            rows={3}
            placeholder="Mô tả lý do nghỉ phép..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <FormField label="Ghi chú bổ sung">
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={2}
            placeholder="Ghi chú bổ sung (tùy chọn)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo yêu cầu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
