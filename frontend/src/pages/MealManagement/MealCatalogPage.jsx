import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, ChefHat } from "lucide-react";
import { mealService } from "../../utils/mealService";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

const CATEGORIES = {
  COM: "Cơm", PHO: "Phở", BANHMI: "Bánh mì", CHAO: "Cháo",
  COMCHIEN: "Cơm chiên", MIY: "Mì Ý", SALAD: "Salad", FASTFOOD: "Thức ăn nhanh", KHAC: "Khác",
};

const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

export default function MealCatalogPage() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({ code: "", name: "", description: "", price: 0, category: "COM", supplier: "", status: "AVAILABLE", startTime: "", endTime: "" });

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await mealService.getAllMeals();
      setMeals(res.meals || []);
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách suất ăn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const resetForm = () => {
    setFormData({ code: "", name: "", description: "", price: 0, category: "COM", supplier: "", status: "AVAILABLE", startTime: "", endTime: "" });
    setEditingMeal(null);
    setShowForm(false);
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({ code: meal.code, name: meal.name, description: meal.description || "", price: meal.price, category: meal.category, supplier: meal.supplier || "", status: meal.status, startTime: meal.startTime || "", endTime: meal.endTime || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMeal) {
        await mealService.updateMeal(editingMeal._id, formData);
        handleApiSuccess("Cập nhật suất ăn thành công");
      } else {
        await mealService.createMeal(formData);
        handleApiSuccess("Tạo suất ăn thành công");
      }
      resetForm();
      fetchMeals();
    } catch (error) {
      handleApiError(error, "Lỗi khi lưu suất ăn");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa suất ăn này?")) return;
    try {
      await mealService.deleteMeal(id);
      handleApiSuccess("Xóa suất ăn thành công");
      fetchMeals();
    } catch (error) {
      handleApiError(error, "Lỗi khi xóa suất ăn");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate("/meal")} className="flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-4">
          <ArrowLeft size={20} /> Quay lại
        </button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-teal-600" /> Danh mục suất ăn
          </h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm suất ăn
          </button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-lg font-semibold mb-4">{editingMeal ? "Sửa suất ăn" : "Thêm suất ăn mới"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã suất ăn *</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required disabled={!!editingMeal}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500">
                    {Object.entries(CATEGORIES).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên suất ăn *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND) *</label>
                  <input type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500">
                    <option value="AVAILABLE">Có sẵn</option>
                    <option value="UNAVAILABLE">Hết hàng</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                <input type="text" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">{editingMeal ? "Cập nhật" : "Tạo mới"}</button>
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Đang tải...</div>
        ) : meals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có suất ăn nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà CC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meals.map((meal) => (
                  <tr key={meal._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{meal.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meal.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{CATEGORIES[meal.category] || meal.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">{formatPrice(meal.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{meal.supplier || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${meal.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {meal.status === "AVAILABLE" ? "Có sẵn" : "Hết hàng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(meal)} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(meal._id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
