import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";
import LuggageStats from "./LuggageStats";
import LuggageDetail from "./LuggageDetail";

const statusColors = {
  CHECKED_IN: "bg-blue-100 text-blue-800",
  CHECKED_OUT: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
  DAMAGED: "bg-yellow-100 text-yellow-800",
  RETURNED: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  CHECKED_IN: "Vừa mang vào",
  CHECKED_OUT: "Đã mang ra",
  LOST: "Mất",
  DAMAGED: "Hư hỏng",
  RETURNED: "Đã trả lại",
};

const itemTypeLabels = {
  PERSONAL_ITEM: "Đồ personal",
  LUGGAGE: "Hành lý",
  VEHICLE: "Phương tiện",
  EQUIPMENT: "Thiết bị",
  OTHER: "Khác",
};

const LuggagePage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [luggage, setLuggage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLuggage, setSelectedLuggage] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    itemType: "",
    page: 1,
    limit: 20,
  });

  const fetchLuggage = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.LUGGAGE_WITH_FILTERS(
          filters.status,
          null,
          filters.itemType,
          filters.page,
          filters.limit,
        ),
      );
      setLuggage(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách hành lý");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchLuggage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab, refreshCount]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Hành Lý</h1>
        <p className="text-gray-600 mt-1">
          Ghi nhận và theo dõi vật dụng mà khách mang vào/ra cổng
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === "list"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Danh Sách Hành Lý
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === "stats"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Thống Kê
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "list" ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Bộ Lọc</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trạng Thái
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value, page: 1 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả</option>
                  <option value="CHECKED_IN">Vừa mang vào</option>
                  <option value="CHECKED_OUT">Đã mang ra</option>
                  <option value="LOST">Mất</option>
                  <option value="DAMAGED">Hư hỏng</option>
                  <option value="RETURNED">Đã trả lại</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Loại Vật Dụng
                </label>
                <select
                  value={filters.itemType}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      itemType: e.target.value,
                      page: 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả</option>
                  <option value="PERSONAL_ITEM">Đồ personal</option>
                  <option value="LUGGAGE">Hành lý</option>
                  <option value="VEHICLE">Phương tiện</option>
                  <option value="EQUIPMENT">Thiết bị</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      status: "",
                      itemType: "",
                      page: 1,
                      limit: 20,
                    });
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : luggage.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                Không tìm thấy hành lý nào
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Tracking
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Vật Dụng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Loại
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Số Lượng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Giá Trị
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Check-In
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {luggage.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-blue-600">
                          {item.trackingCode}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            {item.description && (
                              <p className="text-gray-500 text-xs">
                                {item.description.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {itemTypeLabels[item.itemType] || item.itemType}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.estimatedValue
                            ? `${item.estimatedValue.toLocaleString()} ₫`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[item.status] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusLabels[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.checkedInAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setSelectedLuggage(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Chi Tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <LuggageStats />
      )}

      {/* Detail Modal */}
      {selectedLuggage && (
        <LuggageDetail
          luggage={selectedLuggage}
          onClose={() => setSelectedLuggage(null)}
          onUpdate={() => setRefreshCount(refreshCount + 1)}
        />
      )}
    </div>
  );
};

export default LuggagePage;
