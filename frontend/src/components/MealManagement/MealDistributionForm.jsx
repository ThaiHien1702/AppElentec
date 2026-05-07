import React, { useState, useEffect } from "react";
import {
  mealDistributionService,
  mealService,
} from "../../utils/mealManagementService";
const MealDistributionForm = ({ onSuccess = null }) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    meal_id: "",
    quantity: 1,
    distribution_date: new Date().toISOString().split("T")[0],
    distribution_time: new Date().toTimeString().slice(0, 5),
    notes: "",
  });

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy danh sách suất ăn
  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await mealService.getAll({ status: "available" });
      if (response.success) {
        setMeals(response.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách suất ăn:", err);
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
      if (
        !formData.employee_id ||
        !formData.meal_id ||
        !formData.distribution_date
      ) {
        setError("Vui lòng điền tất cả các trường bắt buộc");
        return;
      }

      const response = await mealDistributionService.create(formData);

      if (response.success) {
        setSuccess("Tạo xuất ăn thành công");
        setFormData({
          employee_id: "",
          meal_id: "",
          quantity: 1,
          distribution_date: new Date().toISOString().split("T")[0],
          distribution_time: new Date().toTimeString().slice(0, 5),
          notes: "",
        });
        if (onSuccess) {
          setTimeout(onSuccess, 1500);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tạo xuất ăn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg max-w-2xl mx-auto shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Tạo xuất ăn
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
            Nhân viên ID *
          </label>
          <input
            type="number"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            placeholder="Nhập ID nhân viên"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700 text-sm">
            Suất ăn *
          </label>
          <select
            name="meal_id"
            value={formData.meal_id}
            onChange={handleInputChange}
            disabled={loading || meals.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
          >
            <option value="">Chọn suất ăn</option>
            {meals.map((meal) => (
              <option key={meal.id} value={meal.id}>
                {meal.name} - {meal.price?.toLocaleString()} VNĐ
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Số lượng
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Ngày xuất ăn *
            </label>
            <input
              type="date"
              name="distribution_date"
              value={formData.distribution_date}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Thời gian
            </label>
            <input
              type="time"
              name="distribution_time"
              value={formData.distribution_time}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700 text-sm">
            Ghi chú
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Ghi chú thêm..."
            disabled={loading}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-600 font-inherit"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo xuất ăn"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealDistributionForm;
