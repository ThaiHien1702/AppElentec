import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { mealService } from "../../utils/mealService";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const MEAL_TIME_OPTIONS = [
  { value: "BREAKFAST", label: "Bữa sáng" },
  { value: "LUNCH", label: "Bữa trưa" },
  { value: "DINNER", label: "Bữa tối" },
];

export default function MealRegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    mealId: "",
    quantity: 1,
    distributionDate: new Date().toISOString().split("T")[0],
    mealTime: "LUNCH",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedMeal, setSelectedMeal] = useState(null);

  const canManage = user.role === "admin" || user.role === "moderator";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mealRes = await mealService.getAllMeals(null, "AVAILABLE");
        setMeals(mealRes.meals || []);

        if (canManage) {
          const empRes = await axiosInstance.get(API_PATHS.MODERATOR_USERS);
          setEmployees(empRes.data?.users || empRes.data || []);
        } else {
          setFormData((prev) => ({ ...prev, employeeId: user.id }));
        }
      } catch (error) {
        handleApiError(error, "Lỗi khi tải dữ liệu");
      }
    };
    fetchData();
  }, [canManage, user.id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    if (field === "mealId") {
      const meal = meals.find((m) => m._id === value);
      setSelectedMeal(meal || null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = "Vui lòng chọn nhân viên";
    if (!formData.mealId) newErrors.mealId = "Vui lòng chọn suất ăn";
    if (!formData.distributionDate) newErrors.distributionDate = "Vui lòng chọn ngày";
    if (formData.quantity < 1) newErrors.quantity = "Số lượng phải ít nhất 1";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await mealService.createDistribution(formData);
      handleApiSuccess("Tạo xuất ăn thành công");
      navigate("/meal");
    } catch (error) {
      handleApiError(error, "Không thể tạo xuất ăn");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = selectedMeal ? selectedMeal.price * formData.quantity : 0;
  const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate("/meal")} className="flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-4 transition-colors">
          <ArrowLeft size={20} /> Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Đăng ký xuất ăn</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để tạo xuất ăn cho nhân viên</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chọn nhân viên */}
          {canManage ? (
            <FormField label="Nhân viên" required error={errors.employeeId}>
              <select value={formData.employeeId} onChange={(e) => handleChange("employeeId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">-- Chọn nhân viên --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.displayName} ({emp.department || "N/A"})
                  </option>
                ))}
              </select>
            </FormField>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="text-sm text-gray-600"><span className="font-semibold">Nhân viên:</span> {user.displayName}</p>
            </div>
          )}

          {/* Chọn suất ăn */}
          <FormField label="Suất ăn" required error={errors.mealId}>
            <select value={formData.mealId} onChange={(e) => handleChange("mealId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">-- Chọn suất ăn --</option>
              {meals.map((meal) => (
                <option key={meal._id} value={meal._id}>
                  {meal.name} - {formatPrice(meal.price)}
                </option>
              ))}
            </select>
          </FormField>

          {/* Ngày + Bữa + Số lượng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Ngày xuất ăn" required error={errors.distributionDate}>
              <input type="date" value={formData.distributionDate} onChange={(e) => handleChange("distributionDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </FormField>
            <FormField label="Bữa ăn" required>
              <select value={formData.mealTime} onChange={(e) => handleChange("mealTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                {MEAL_TIME_OPTIONS.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </FormField>
            <FormField label="Số lượng" required error={errors.quantity}>
              <input type="number" min="1" value={formData.quantity} onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </FormField>
          </div>

          {/* Tổng tiền */}
          {selectedMeal && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <p className="text-sm text-orange-700">
                <span className="font-semibold">Tổng tiền:</span> {formatPrice(totalPrice)} ({formData.quantity} x {formatPrice(selectedMeal.price)})
              </p>
            </div>
          )}

          {/* Ghi chú */}
          <FormField label="Ghi chú (tùy chọn)">
            <textarea value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Thêm ghi chú nếu cần..." rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </FormField>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
              {loading ? "Đang tạo..." : "Tạo xuất ăn"}
            </Button>
            <Button type="button" onClick={() => navigate("/meal")} disabled={loading} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800">
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
