import React, { useState, useEffect } from "react";
import { mealService } from "../../utils/mealManagementService";

const MealList = ({ onSelectMeal = null, showActions = true }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    search: "",
  });
  const [error, setError] = useState("");

  // Lấy danh sách suất ăn
  useEffect(() => {
    fetchMeals();
  }, [filters]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await mealService.getAll(filters);
      if (response.success) {
        setMeals(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách suất ăn");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusChange = async (mealId, newStatus) => {
    try {
      await mealService.updateStatus(mealId, newStatus);
      fetchMeals();
    } catch (err) {
      setError("Lỗi khi cập nhật trạng thái");
    }
  };

  return (
    <div className="p-5 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Tìm kiếm suất ăn..."
          name="search"
          value={filters.search}
          onChange={handleSearchChange}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-40"
        />

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-40"
        >
          <option value="">Tất cả danh mục</option>
          <option value="Com">Cơm</option>
          <option value="Pho">Phở</option>
          <option value="BanhMi">Bánh mì</option>
          <option value="Chao">Cháo</option>
          <option value="ComChien">Cơm chiên</option>
          <option value="MiY">Mì Ý</option>
          <option value="Salad">Salad</option>
          <option value="ThucAnNhanh">Thức ăn nhanh</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-40"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="available">Có sẵn</option>
          <option value="unavailable">Hết hàng</option>
        </select>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          Đang tải...
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          Không có suất ăn nào
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  {meal.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    meal.status === "available"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {meal.status === "available" ? "Có sẵn" : "Hết hàng"}
                </span>
              </div>

              <div className="mb-3 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Mã:</span>{" "}
                  {meal.code}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Giá:</span>{" "}
                  {meal.price?.toLocaleString()} VNĐ
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Danh mục:</span>{" "}
                  {meal.category}
                </p>
                {meal.description && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">Mô tả:</span>{" "}
                    {meal.description}
                  </p>
                )}
              </div>

              {showActions && (
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
                    onClick={() => onSelectMeal && onSelectMeal(meal)}
                  >
                    Chọn
                  </button>
                  <select
                    value={meal.status}
                    onChange={(e) =>
                      handleStatusChange(meal.id, e.target.value)
                    }
                    className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="available">Có sẵn</option>
                    <option value="unavailable">Hết hàng</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealList;
