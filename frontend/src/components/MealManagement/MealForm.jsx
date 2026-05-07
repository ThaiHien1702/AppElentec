import React, { useState, useEffect } from "react";
import { mealService } from "../../utils/mealManagementService";

const MealForm = ({ mealId = null, onSuccess = null }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    price: "",
    category: "",
    supplier_id: "",
    status: "available",
    start_time: "",
    end_time: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy thông tin suất ăn nếu là edit
  useEffect(() => {
    if (mealId) {
      fetchMealData();
    }
  }, [mealId]);

  const fetchMealData = async () => {
    try {
      setLoading(true);
      const response = await mealService.getById(mealId);
      if (response.success) {
        setFormData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Lỗi khi tải thông tin suất ăn");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Validate
      if (!formData.code || !formData.name || !formData.price) {
        setError("Vui lòng điền tất cả các trường bắt buộc");
        return;
      }

      let response;
      if (mealId) {
        response = await mealService.update(mealId, formData);
      } else {
        response = await mealService.create(formData);
      }

      if (response.success) {
        setSuccess(response.message);
        if (!mealId) {
          setFormData({
            code: "",
            name: "",
            description: "",
            price: "",
            category: "",
            supplier_id: "",
            status: "available",
            start_time: "",
            end_time: "",
          });
        }
        if (onSuccess) {
          setTimeout(onSuccess, 1500);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi lưu suất ăn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg max-w-2xl mx-auto shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {mealId ? "Cập nhật suất ăn" : "Tạo suất ăn mới"}
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 mb-4 bg-green-100 text-green-800 rounded-md border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-gray-700 text-sm">
            Mã suất ăn *
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="VD: COM001"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700 text-sm">
            Tên suất ăn *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="VD: Cơm tấm"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700 text-sm">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả chi tiết về suất ăn"
            disabled={loading}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600 font-inherit"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Giá tiền (VNĐ) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="50000"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Danh mục
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            >
              <option value="">Chọn danh mục</option>
              <option value="Com">Cơm</option>
              <option value="Pho">Phở</option>
              <option value="BanhMi">Bánh mì</option>
              <option value="Chao">Cháo</option>
              <option value="ComChien">Cơm chiên</option>
              <option value="MiY">Mì Ý</option>
              <option value="Salad">Salad</option>
              <option value="ThucAnNhanh">Thức ăn nhanh</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Thời gian bắt đầu
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Thời gian kết thúc
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Nhà cung cấp ID
            </label>
            <input
              type="number"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleInputChange}
              placeholder="ID nhà cung cấp"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            >
              <option value="available">Có sẵn</option>
              <option value="unavailable">Hết hàng</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : mealId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealForm;
