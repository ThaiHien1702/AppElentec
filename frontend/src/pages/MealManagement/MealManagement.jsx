import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Plus,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Download,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { mealService } from "../../utils/mealService";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import MealDistributionDetail from "./components/MealDistributionDetail";
import MealStats from "./components/MealStats";

const MEAL_TIMES = {
  BREAKFAST: { label: "Bữa sáng", color: "bg-orange-100 text-orange-800" },
  LUNCH: { label: "Bữa trưa", color: "bg-blue-100 text-blue-800" },
  DINNER: { label: "Bữa tối", color: "bg-purple-100 text-purple-800" },
};

const STATUS_TYPES = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  SERVED: { label: "Đã phát", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", color: "bg-gray-100 text-gray-800", icon: XCircle },
};

export default function MealManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  const canManage = user.role === "admin" || user.role === "moderator";

  const fetchDistributions = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (canManage) {
        response = await mealService.getAllDistributions({
          status: filterStatus || undefined,
          page: currentPage,
          limit: 10,
        });
      } else {
        response = await mealService.getMyDistributions(
          filterStatus || undefined,
          currentPage,
          10,
        );
      }
      setDistributions(response.distributions || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách xuất ăn");
    } finally {
      setLoading(false);
    }
  }, [canManage, filterStatus, currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await mealService.getStats();
      setStats(response);
    } catch (error) {
      console.error("Failed to fetch meal stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchDistributions();
    fetchStats();
  }, [fetchDistributions, fetchStats]);

  const handleConfirm = async (id) => {
    try {
      await mealService.confirmDistribution(id);
      handleApiSuccess("Xác nhận xuất ăn thành công");
      fetchDistributions();
      fetchStats();
    } catch (error) {
      handleApiError(error, "Lỗi khi xác nhận xuất ăn");
    }
  };

  const handleServe = async (id) => {
    try {
      await mealService.serveDistribution(id);
      handleApiSuccess("Đã phát suất ăn thành công");
      fetchDistributions();
      fetchStats();
    } catch (error) {
      handleApiError(error, "Lỗi khi phát suất ăn");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy xuất ăn này?")) return;
    try {
      await mealService.cancelDistribution(id);
      handleApiSuccess("Hủy xuất ăn thành công");
      fetchDistributions();
      fetchStats();
    } catch (error) {
      handleApiError(error, "Lỗi khi hủy xuất ăn");
    }
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.MEALS_DISTRIBUTIONS_EXPORT(filterStatus),
        { responseType: "blob" },
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meal-distributions-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleApiError(error, "Lỗi khi xuất Excel");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("vi-VN");
  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-orange-600" />
          Quản lý xuất ăn
        </h1>
        <div className="inline-flex h-10 items-center gap-2 self-start">
          <button
            onClick={() => navigate("/meal/register")}
            className="h-10 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo xuất ăn
          </button>
          {canManage && (
            <>
              <button
                onClick={() => navigate("/meal/catalog")}
                className="h-10 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2"
              >
                <ChefHat className="w-4 h-4" />
                Danh mục
              </button>
              <button
                onClick={handleExport}
                className="h-10 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </>
          )}
        </div>
      </div>

      {stats && <MealStats stats={stats} />}

      {/* Bộ lọc */}
      <div className="mb-6">
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 w-full sm:w-64 shadow-sm">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="w-full bg-transparent border-none text-sm focus:ring-0 outline-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SERVED">Đã phát</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Đang tải...</div>
        ) : distributions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có xuất ăn nào</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suất ăn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bữa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distributions.map((item) => {
                    const StatusIcon = STATUS_TYPES[item.status]?.icon || Clock;
                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.employee?.displayName || "N/A"}</div>
                          <div className="text-sm text-gray-500">{item.department || ""}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.meal?.name || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${MEAL_TIMES[item.mealTime]?.color || ""}`}>
                            {MEAL_TIMES[item.mealTime]?.label || item.mealTime}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.distributionDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(item.totalPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${STATUS_TYPES[item.status]?.color || ""}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {STATUS_TYPES[item.status]?.label || item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button onClick={() => { setSelectedItem(item); setShowDetail(true); }} className="text-blue-600 hover:text-blue-900" title="Xem chi tiết">
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManage && item.status === "PENDING" && (
                              <button onClick={() => handleConfirm(item._id)} className="text-green-600 hover:text-green-900" title="Xác nhận">
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {canManage && item.status === "CONFIRMED" && (
                              <button onClick={() => handleServe(item._id)} className="text-emerald-600 hover:text-emerald-900" title="Đã phát">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {item.status !== "SERVED" && item.status !== "CANCELLED" && (
                              <button onClick={() => handleCancel(item._id)} className="text-red-600 hover:text-red-900" title="Hủy">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">
                    Trang <span className="font-medium">{currentPage}</span> trên <span className="font-medium">{totalPages}</span>
                  </p>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">‹</button>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">›</button>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal chi tiết */}
      {showDetail && selectedItem && (
        <MealDistributionDetail
          distribution={selectedItem}
          onClose={() => { setShowDetail(false); setSelectedItem(null); }}
          onConfirm={canManage ? handleConfirm : null}
          onServe={canManage ? handleServe : null}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
