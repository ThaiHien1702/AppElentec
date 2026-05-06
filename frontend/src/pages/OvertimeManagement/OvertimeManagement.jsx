import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Plus,
  Check,
  X,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Edit3,
  Save,
  Download,
  Upload,
  FileText,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { overtimeService } from "../../utils/overtimeService";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import {
  exportOvertimeData,
  downloadOvertimeTemplate,
  importOvertimeData,
  formatImportResults,
} from "../../utils/excelUtils";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ duyệt",
    bg: "#FEF3C7",
    color: "#92400E",
    icon: Clock,
  },
  APPROVED: {
    label: "Đã duyệt",
    bg: "#D1FAE5",
    color: "#065F46",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Từ chối",
    bg: "#FEE2E2",
    color: "#991B1B",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "#F3F4F6",
    color: "#6B7280",
    icon: X,
  },
  COMPLETED: {
    label: "Hoàn thành",
    bg: "#DBEAFE",
    color: "#1E40AF",
    icon: CheckCircle,
  },
};

export default function OvertimeManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editingResult, setEditingResult] = useState(null);
  const [resultForm, setResultForm] = useState({
    otResultStart: "",
    otResultFinish: "",
  });
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  const canApprove = user?.role === "admin" || user?.role === "moderator";

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (canApprove) {
        response = await overtimeService.getAllOvertimeRequests(
          filterStatus || undefined,
          undefined,
          undefined,
          undefined,
          currentPage,
          20,
        );
      } else {
        response = await overtimeService.getMyOvertimeRequests(
          filterStatus || undefined,
          currentPage,
          20,
        );
      }

      setRequests(response.overtimeRequests || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách OT");
    } finally {
      setLoading(false);
    }
  }, [canApprove, filterStatus, currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    try {
      await overtimeService.approveOvertimeRequest(id);
      handleApiSuccess("Đã phê duyệt yêu cầu OT");
      fetchRequests();
    } catch (error) {
      handleApiError(error, "Lỗi khi phê duyệt");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Lý do từ chối:");
    if (!reason) return;
    try {
      await overtimeService.rejectOvertimeRequest(id, reason);
      handleApiSuccess("Đã từ chối yêu cầu OT");
      fetchRequests();
    } catch (error) {
      handleApiError(error, "Lỗi khi từ chối");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu OT này?")) return;
    try {
      await overtimeService.cancelOvertimeRequest(id);
      handleApiSuccess("Đã hủy yêu cầu OT");
      fetchRequests();
    } catch (error) {
      handleApiError(error, "Lỗi khi hủy");
    }
  };

  const handleSaveResult = async (id) => {
    try {
      await overtimeService.updateOvertimeResult(id, resultForm);
      handleApiSuccess("Đã cập nhật kết quả OT");
      setEditingResult(null);
      setResultForm({ otResultStart: "", otResultFinish: "" });
      fetchRequests();
    } catch (error) {
      handleApiError(error, "Lỗi khi cập nhật kết quả");
    }
  };

  const startEditResult = (req) => {
    setEditingResult(req._id);
    setResultForm({
      otResultStart: req.otResultStart || "",
      otResultFinish: req.otResultFinish || "",
    });
  };

  const handleExportData = () => {
    try {
      exportOvertimeData(filterStatus);
    } catch (error) {
      handleApiError(error, "Lỗi khi xuất dữ liệu Excel");
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const result = await importOvertimeData(file);
      const formatted = formatImportResults(result);
      toast.success(
        `Import thành công ${formatted.success}/${formatted.total} bản ghi`,
      );
      fetchRequests();
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Đăng ký làm thêm (OT)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý và theo dõi đăng ký giờ làm thêm
          </p>
        </div>
        <div className="inline-flex h-10 items-center gap-2 self-start">
          <button
            onClick={() => navigate("/overtime/register")}
            className="h-10 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Đăng ký OT
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
                onClick={downloadOvertimeTemplate}
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = requests.filter((r) => r.status === key).length;
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              className="rounded-xl p-4 flex items-center gap-3 transition-shadow shadow-xs border border-gray-100"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-white/30">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{count}</div>
                <div className="text-[10px] md:text-xs font-medium opacity-80 uppercase tracking-wider">
                  {cfg.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Lọc nhanh
          </span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer transition-all"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="COMPLETED">Hoàn thành</option>
        </select>
        <div className="ml-auto text-xs text-gray-400 font-medium">
          Tổng số: <span className="text-gray-900">{totalItems}</span> bản ghi
        </div>
      </div>

      {/* Table - Excel style */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-3 animate-spin" />
            Đang tải dữ liệu...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p>Chưa có yêu cầu OT nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-700 text-white uppercase tracking-wider font-bold">
                    <th className="p-3 border-r border-emerald-600/30">No.</th>
                    <th className="p-3 border-r border-emerald-600/30">ID</th>
                    <th className="p-3 border-r border-emerald-600/30">Name</th>
                    <th className="p-3 border-r border-emerald-600/30">Dept</th>
                    <th className="p-3 border-r border-emerald-600/30">
                      Position
                    </th>
                    <th className="p-3 border-r border-emerald-600/30">
                      Check in
                    </th>
                    <th
                      colSpan={2}
                      className="p-3 border-r border-emerald-600/30 text-center bg-emerald-800/50"
                    >
                      OT PLAN
                    </th>
                    <th
                      colSpan={2}
                      className="p-3 border-r border-emerald-600/30 text-center bg-amber-800/50"
                    >
                      OT RESULT
                    </th>
                    <th className="p-3 border-r border-emerald-600/30">
                      Reason for OT
                    </th>
                    <th className="p-3 border-r border-emerald-600/30">
                      Trạng thái
                    </th>
                    <th className="p-3">Thao tác</th>
                  </tr>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b-2 border-gray-200">
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200 text-center bg-emerald-50">
                      OT Start
                    </th>
                    <th className="p-2 border-r border-gray-200 text-center bg-emerald-50">
                      OT Finish
                    </th>
                    <th className="p-2 border-r border-gray-200 text-center bg-amber-50">
                      OT Start
                    </th>
                    <th className="p-2 border-r border-gray-200 text-center bg-amber-50">
                      OT Finish
                    </th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req, idx) => {
                    const statusCfg =
                      STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusCfg.icon;
                    const isOwner =
                      req.user?._id === user?.id || req.user?._id === user?._id;
                    const isEditingThis = editingResult === req._id;

                    return (
                      <tr
                        key={req._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 text-gray-500">
                          {(currentPage - 1) * 20 + idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-blue-700">
                          {req.user?.idCompanny || "—"}
                        </td>
                        <td className="p-3 font-medium text-gray-900">
                          {req.user?.displayName || "—"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {req.user?.department || "—"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {req.user?.position || "—"}
                        </td>
                        <td className="p-3 whitespace-nowrap text-gray-600">
                          {formatDate(req.checkInDate)}
                        </td>

                        {/* OT Plan */}
                        <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                          {req.otPlanStart}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                          {req.otPlanFinish}
                        </td>

                        {/* OT Result */}
                        <td className="p-3 text-center bg-amber-50/30">
                          {isEditingThis ? (
                            <input
                              type="time"
                              value={resultForm.otResultStart}
                              onChange={(e) =>
                                setResultForm((p) => ({
                                  ...p,
                                  otResultStart: e.target.value,
                                }))
                              }
                              className="w-24 p-1 border border-amber-300 rounded bg-white text-center"
                            />
                          ) : (
                            <span
                              className={
                                req.otResultStart
                                  ? "font-bold text-amber-800"
                                  : "text-gray-300"
                              }
                            >
                              {req.otResultStart || "—"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center bg-amber-50/30">
                          {isEditingThis ? (
                            <input
                              type="time"
                              value={resultForm.otResultFinish}
                              onChange={(e) =>
                                setResultForm((p) => ({
                                  ...p,
                                  otResultFinish: e.target.value,
                                }))
                              }
                              className="w-24 p-1 border border-amber-300 rounded bg-white text-center"
                            />
                          ) : (
                            <span
                              className={
                                req.otResultFinish
                                  ? "font-bold text-amber-800"
                                  : "text-gray-300"
                              }
                            >
                              {req.otResultFinish || "—"}
                            </span>
                          )}
                        </td>

                        <td
                          className="p-3 max-w-50 truncate text-gray-600"
                          title={req.reason}
                        >
                          {req.reason}
                        </td>

                        <td className="p-3">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                            style={{
                              backgroundColor: statusCfg.bg,
                              color: statusCfg.color,
                            }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {canApprove && req.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(req._id)}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                  title="Phê duyệt"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(req._id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Từ chối"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {canApprove &&
                              (req.status === "APPROVED" ||
                                req.status === "COMPLETED") &&
                              !isEditingThis && (
                                <button
                                  onClick={() => startEditResult(req)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  title="Sửa kết quả"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              )}
                            {isEditingThis && (
                              <>
                                <button
                                  onClick={() => handleSaveResult(req._id)}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                  title="Lưu"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingResult(null)}
                                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                  title="Hủy"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {isOwner && req.status === "PENDING" && (
                              <button
                                onClick={() => handleCancel(req._id)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                title="Hủy yêu cầu"
                              >
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-gray-100 bg-gray-50/30">
                <span className="text-xs text-gray-500 font-medium">
                  Trang {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
