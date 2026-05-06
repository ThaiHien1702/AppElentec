import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Download, Upload } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";
import {
  exportLuggageData,
  downloadLuggageTemplate,
  importLuggageData,
  formatImportResults,
} from "../../utils/excelUtils";
import LuggageStats from "../Access/LuggageStats";
import LuggageDetail from "../Access/LuggageDetail";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

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

const LuggageManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("list");
  const [luggage, setLuggage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLuggage, setSelectedLuggage] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    itemType: "",
    page: 1,
    limit: 20,
  });

  const fetchLuggage = useCallback(async () => {
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
  }, [filters]);

  useEffect(() => {
    if (activeTab === "list") {
      fetchLuggage();
    }
  }, [filters, activeTab, refreshCount, fetchLuggage]);

  const handleExportData = () => {
    try {
      exportLuggageData(filters.status);
    } catch (error) {
      handleApiError(error, "Lỗi khi xuất dữ liệu Excel");
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const result = await importLuggageData(file);
      const formatted = formatImportResults(result);
      toast.success(
        `Import thành công ${formatted.success}/${formatted.total} bản ghi`,
      );
      fetchLuggage();
    } catch (error) {
      handleApiError(error, "Lỗi khi import dữ liệu Excel");
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const canApprove = user?.role === "admin" || user?.role === "moderator";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Quản lý đồ đạc
        </h1>
        <div className="inline-flex h-10 items-center gap-2 self-start">
          <button
            onClick={() => navigate("/luggage/register")}
            className="h-10 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo yêu cầu
          </button>

          {canApprove && (
            <>
              <button
                onClick={handleImportClick}
                disabled={importLoading}
                className="h-10 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                title="Import từ Excel"
              >
                <Upload className="w-4 h-4" />
                {importLoading ? "Đang import..." : "Import Excel"}
              </button>
              <button
                onClick={handleExportData}
                className="h-10 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-2"
                title="Xuất danh sách sang Excel"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={downloadLuggageTemplate}
                className="h-10 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 flex items-center gap-2"
                title="Tải mẫu Excel"
              >
                <Download className="w-4 h-4" />
                Tải mẫu
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFile}
                className="hidden"
              />
            </>
          )}
        </div>
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

export default LuggageManagement;
