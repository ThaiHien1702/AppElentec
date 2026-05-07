import React, { useState, useEffect } from "react";
import { mealDistributionService } from "../../utils/mealManagementService";
import { Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";

const MealDistributionList = ({ onRefresh = null }) => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "",
  });

  useEffect(() => {
    fetchDistributions();
  }, [filters]);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await mealDistributionService.getAll(filters);
      if (response.success) {
        setDistributions(response.data || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      const response = await mealDistributionService.confirm(id);
      if (response.success) {
        fetchDistributions();
        if (onRefresh) onRefresh();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi xác nhận");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa xuất ăn này?")) {
      try {
        const response = await mealDistributionService.delete(id);
        if (response.success) {
          fetchDistributions();
          if (onRefresh) onRefresh();
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message || "Lỗi khi xóa");
      }
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Chờ xác nhận",
          icon: Clock,
          color: "bg-yellow-100 text-yellow-800",
        };
      case "confirmed":
        return {
          label: "Đã xác nhận",
          icon: CheckCircle,
          color: "bg-blue-100 text-blue-800",
        };
      case "served":
        return {
          label: "Đã phát",
          icon: CheckCircle,
          color: "bg-green-100 text-green-800",
        };
      default:
        return {
          label: "Không xác định",
          icon: AlertCircle,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Danh sách xuất ăn
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-semibold mb-1 text-gray-700 text-sm">
            Ngày
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700 text-sm">
            Trạng thái
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="served">Đã phát</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Nhân viên
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Suất ăn
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Số lượng
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Phòng ban
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Thời gian
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {distributions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              distributions.map((dist) => {
                const statusInfo = getStatusInfo(dist.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr
                    key={dist.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {dist.employee_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {dist.meal_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-semibold">
                      {dist.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {dist.department_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {dist.distribution_date} {dist.distribution_time || ""}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                      >
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <div className="flex gap-2 justify-center">
                        {dist.status === "pending" && (
                          <button
                            onClick={() => handleConfirm(dist.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors"
                          >
                            Xác nhận
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(dist.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MealDistributionList;
