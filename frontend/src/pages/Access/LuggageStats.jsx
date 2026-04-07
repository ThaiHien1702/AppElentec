import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";

const LuggageStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.LUGGAGE_STATS);
      setStats(response.data);
    } catch (error) {
      handleApiError(error, "Lỗi khi tải thống kê hành lý");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    CHECKED_IN: {
      label: "Vừa mang vào",
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    CHECKED_OUT: {
      label: "Đã mang ra",
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    LOST: { label: "Mất", color: "bg-red-500", textColor: "text-red-600" },
    DAMAGED: {
      label: "Hư hỏng",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    RETURNED: {
      label: "Đã trả lại",
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
  };

  const itemTypeLabels = {
    PERSONAL_ITEM: "Đồ personal",
    LUGGAGE: "Hành lý",
    VEHICLE: "Phương tiện",
    EQUIPMENT: "Thiết bị",
    OTHER: "Khác",
  };

  return (
    <div className="space-y-6">
      {/* Thống kê theo trạng thái */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Thống Kê Theo Trạng Thái</h3>

        {!stats?.byStatus || stats.byStatus.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.byStatus.map((item) => {
              const config = statusConfig[item._id] || {
                label: item._id,
                color: "bg-gray-500",
                textColor: "text-gray-600",
              };
              return (
                <div
                  key={item._id}
                  className={`rounded-lg p-6 text-white text-center ${config.color}`}
                >
                  <div className="text-3xl font-bold">{item.count}</div>
                  <div className="text-sm mt-2">{config.label}</div>
                  {item.totalValue && (
                    <div className="text-xs mt-2 opacity-90">
                      {(item.totalValue / 1000000).toFixed(1)}M ₫
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Thống kê theo loại */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">
          Thống Kê Theo Loại Vật Dụng
        </h3>

        {!stats?.byType || stats.byType.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.byType.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className="font-medium">
                  {itemTypeLabels[item._id] || item._id}
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (item.count /
                            stats.byType.reduce((sum, s) => sum + s.count, 0)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-bold text-blue-600 min-w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tổng hợp */}
      <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 text-sm">Tổng Hành Lý</p>
            <p className="text-3xl font-bold mt-1">
              {stats?.byStatus?.reduce((sum, s) => sum + s.count, 0) || 0}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Đang Ở Cổng</p>
            <p className="text-3xl font-bold mt-1">
              {stats?.byStatus?.find((s) => s._id === "CHECKED_IN")?.count || 0}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Đã Mang Ra</p>
            <p className="text-3xl font-bold mt-1">
              {stats?.byStatus?.find((s) => s._id === "CHECKED_OUT")?.count ||
                0}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-blue-100 text-sm">Tổng Giá Trị</p>
            <p className="text-3xl font-bold mt-1">
              {stats?.byStatus
                ?.reduce((sum, s) => sum + (s.totalValue || 0), 0)
                .toLocaleString()}{" "}
              ₫
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Mất + Hư</p>
            <p className="text-3xl font-bold mt-1">
              {(stats?.byStatus?.find((s) => s._id === "LOST")?.count || 0) +
                (stats?.byStatus?.find((s) => s._id === "DAMAGED")?.count || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuggageStats;
