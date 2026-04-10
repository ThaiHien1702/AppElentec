import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

const ITEM_TYPES = [
  { value: "PERSONAL_ITEM", label: "Đồ personal" },
  { value: "LUGGAGE", label: "Hành lý" },
  { value: "VEHICLE", label: "Phương tiện" },
  { value: "EQUIPMENT", label: "Thiết bị" },
  { value: "OTHER", label: "Khác" },
];

export default function LuggageRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: "",
    itemType: "PERSONAL_ITEM",
    description: "",
    quantity: 1,
    estimatedValue: "",
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

    if (!formData.itemName.trim()) {
      newErrors.itemName = "Vui lòng nhập tên vật dụng";
    }
    if (!formData.itemType) {
      newErrors.itemType = "Vui lòng chọn loại vật dụng";
    }
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = "Vui lòng nhập số lượng lớn hơn 0";
    }
    if (formData.estimatedValue && isNaN(formData.estimatedValue)) {
      newErrors.estimatedValue = "Giá trị phải là số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        estimatedValue: formData.estimatedValue
          ? parseInt(formData.estimatedValue, 10)
          : 0,
      };

      await axiosInstance.post(API_PATHS.LUGGAGE, payload);
      handleApiSuccess("Ghi nhận vật dụng thành công");
      navigate("/luggage");
    } catch (error) {
      handleApiError(error, "Không thể ghi nhận vật dụng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/luggage")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Ghi nhận vật dụng</h1>
        <p className="text-gray-600 mt-2">
          Điền thông tin dưới đây để ghi nhận vật dụng mang vào/ra cổng
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <FormField label="Tên vật dụng" required error={errors.itemName}>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => handleChange("itemName", e.target.value)}
              placeholder="Nhập tên vật dụng..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          {/* Item Type */}
          <FormField label="Loại vật dụng" required error={errors.itemType}>
            <select
              value={formData.itemType}
              onChange={(e) => handleChange("itemType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ITEM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Description */}
          <FormField label="Mô tả (tùy chọn)">
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về vật dụng..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          {/* Quantity and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Số lượng" required error={errors.quantity}>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  handleChange("quantity", parseInt(e.target.value, 10))
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField
              label="Giá trị ước tính (VNĐ)"
              error={errors.estimatedValue}
            >
              <input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleChange("estimatedValue", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Đang ghi nhận..." : "Ghi nhận vật dụng"}
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/luggage")}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Lưu ý:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Mỗi vật dụng được ghi nhận với một mã tracking duy nhất để theo
            dõi
          </li>
          <li>• Vui lòng cung cấp mô tả chi tiết để dễ nhận diện</li>
          <li>• Giá trị ước tính được sử dụng cho mục đích bảo hiểm</li>
          <li>
            • Bạn có thể cập nhật trạng thái vật dụng sau khi ghi nhận thành
            công
          </li>
        </ul>
      </div>
    </div>
  );
}
