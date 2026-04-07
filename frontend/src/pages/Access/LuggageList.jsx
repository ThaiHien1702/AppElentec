import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";

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

const LuggageList = ({ visitId, refreshTrigger, onSelectLuggage }) => {
  const [luggage, setLuggage] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLuggage = async () => {
    if (!visitId) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.LUGGAGE_BY_VISIT(visitId),
      );
      setLuggage(
        Array.isArray(response.data?.items) ? response.data.items : [],
      );
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách hành lý");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLuggage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId, refreshTrigger]);

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

  if (luggage.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500 py-8">
          Chưa có hành lý nào được ghi nhận
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">
          Danh Sách Hành Lý ({luggage.length})
        </h3>
      </div>

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
                        {item.description}
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
                      statusColors[item.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onSelectLuggage?.(item)}
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
    </div>
  );
};

export default LuggageList;
