import React, { useState, useEffect, useCallback } from "react";
import { Users, Edit2, Save, X, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { POSITIONS } from "../../utils/constants";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

export default function PositionManagement() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState({});
  const [statistics, setStatistics] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/positions/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch("/api/positions/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics || []);
      }
    } catch {
      // Thống kê là tùy chọn, bỏ qua lỗi
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchStatistics();
    }
  }, [token, fetchUsers, fetchStatistics]);

  const handleEditStart = (userId, currentPosition) => {
    setEditingUserId(userId);
    setSelectedPosition((prev) => ({ ...prev, [userId]: currentPosition }));
  };

  const handleSavePosition = async (userId) => {
    try {
      const newPosition = selectedPosition[userId];
      if (!newPosition) return;

      const response = await fetch(`/api/positions/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ position: newPosition }),
      });

      if (response.ok) {
        handleApiSuccess("Cập nhật cấp bậc thành công");
        setEditingUserId(null);
        fetchUsers();
        fetchStatistics();
      } else {
        const data = await response.json();
        handleApiError(
          new Error(data.message || "Lỗi cập nhật cấp bậc"),
          "Lỗi cập nhật cấp bậc",
        );
      }
    } catch (error) {
      handleApiError(error, "Lỗi cập nhật cấp bậc");
    }
  };

  const getPositionColor = (position) => {
    const colors = {
      "Quản lý": "bg-red-100 text-red-800 border-red-300",
      "Trợ lý Quản lý": "bg-orange-100 text-orange-800 border-orange-300",
      "Giám sát viên": "bg-blue-100 text-blue-800 border-blue-300",
      "Nhân viên": "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[position] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải thông tin...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Users size={32} className="text-blue-600" />
          Quản lý cấp bậc người dùng
        </h1>
        <p className="text-gray-600">
          Quản lý cấp bậc và phân quyền cho các nhân viên
        </p>
      </div>

      {/* Thống kê */}
      {statistics && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statistics.map((stat) => (
            <div
              key={stat.position}
              className={`p-4 rounded-lg border ${getPositionColor(stat.position)}`}
            >
              <div className="font-semibold">{stat.position}</div>
              <div className="text-2xl font-bold">{stat.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bảng người dùng */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Tên nhân viên
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Bộ phận
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Cấp bậc hiện tại
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {user.displayName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.idCompanny}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.department || "N/A"}
                </td>
                <td className="px-6 py-4">
                  {editingUserId === user._id ? (
                    <div className="relative inline-block">
                      <select
                        value={selectedPosition[user._id] || user.position}
                        onChange={(e) =>
                          setSelectedPosition((prev) => ({
                            ...prev,
                            [user._id]: e.target.value,
                          }))
                        }
                        className="h-9 appearance-none rounded-lg border border-gray-300 py-1 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {POSITIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPositionColor(user.position)}`}
                    >
                      {user.position}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {editingUserId === user._id ? (
                      <>
                        <button
                          onClick={() => handleSavePosition(user._id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded"
                          title="Lưu"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          title="Hủy"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditStart(user._id, user.position)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Không có dữ liệu người dùng
          </div>
        )}
      </div>

      {/* Thông tin mức độ chức vụ */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="font-semibold text-blue-900 mb-4">Mô tả các cấp bậc</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-red-700 mb-2">
              Quản lý (Cấp 4)
            </div>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>✓ Quản lý tất cả người dùng</li>
              <li>✓ Quản lý cấp bậc</li>
              <li>✓ Xem báo cáo</li>
              <li>✓ Xóa dữ liệu</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-orange-700 mb-2">
              Trợ lý Quản lý (Cấp 3)
            </div>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>✓ Xem báo cáo</li>
              <li>✓ Xuất dữ liệu</li>
              <li>✓ Nhập dữ liệu</li>
              <li>✓ Chỉnh sửa máy tính</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-700 mb-2">
              Supervisor (Cấp 2)
            </div>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>✓ Xem báo cáo</li>
              <li>✓ Xuất dữ liệu</li>
              <li>✗ Không thể chỉnh sửa</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">
              Staff (Cấp 1)
            </div>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>✗ Quyền hạn tối thiểu</li>
              <li>✗ Chỉ xem dữ liệu của riêng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
