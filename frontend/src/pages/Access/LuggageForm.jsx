import { useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

const LuggageForm = ({ visitId, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    quantity: 1,
    itemType: "PERSONAL_ITEM",
    estimatedValue: 0,
  });
  const [itemImageData, setItemImageData] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const itemTypes = [
    { value: "PERSONAL_ITEM", label: "Đồ đPersonal" },
    { value: "LUGGAGE", label: "Hành lý" },
    { value: "VEHICLE", label: "Phương tiện" },
    { value: "EQUIPMENT", label: "Thiết bị" },
    { value: "OTHER", label: "Khác" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "estimatedValue"
          ? Number(value)
          : value,
    }));
  };

  const handleImageCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setItemImageData(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName.trim()) {
      handleApiError(null, "Vui lòng nhập tên vật dụng");
      return;
    }

    if (!itemImageData) {
      handleApiError(null, "Vui lòng chụp ảnh vật dụng");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        visitRequestId: visitId,
        ...formData,
        itemImageData,
      };

      const response = await axiosInstance.post(API_PATHS.LUGGAGE_ADD, payload);
      handleApiSuccess(response.data?.message || "Thêm hành lý thành công");

      // Reset form
      setFormData({
        itemName: "",
        description: "",
        quantity: 1,
        itemType: "PERSONAL_ITEM",
        estimatedValue: 0,
      });
      setItemImageData("");

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      handleApiError(error, "Lỗi khi thêm hành lý");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Thêm Hành Lý</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên vật dụng */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tên Vật Dụng *
          </label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            placeholder="Ví dụ: Ba lô xanh, Cái túi, Xe máy"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Mô Tả Chi Tiết
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Ví dụ: Màu xanh lá, logo Nike, có chứa tiền"
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Loại vật dụng */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Loại Vật Dụng
          </label>
          <select
            name="itemType"
            value={formData.itemType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {itemTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Số lượng và Giá trị */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Số Lượng</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá Trị Ước Tính (₫)
            </label>
            <input
              type="number"
              name="estimatedValue"
              value={formData.estimatedValue}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Ảnh vật dụng */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Chụp Ảnh Vật Dụng *
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              disabled={loading}
            >
              Chụp Ảnh
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400"
              disabled={loading}
            >
              Chọn File
            </button>
          </div>
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            onChange={handleImageCapture}
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageCapture}
            className="hidden"
          />

          {itemImageData && (
            <div className="mt-2">
              <img
                src={itemImageData}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => setItemImageData("")}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                Xóa ảnh
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-medium"
        >
          {loading ? "Đang thêm..." : "Thêm Hành Lý"}
        </button>
      </form>
    </div>
  );
};

export default LuggageForm;
