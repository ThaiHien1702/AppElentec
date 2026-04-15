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
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { overtimeService } from "../../utils/overtimeService";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

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
  const [showDetail, setShowDetail] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [resultForm, setResultForm] = useState({
    otResultStart: "",
    otResultFinish: "",
  });

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Group requests by checkInDate for the Excel-like view
  const groupedByDate = requests.reduce((acc, req) => {
    const dateKey = new Date(req.checkInDate).toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(req);
    return acc;
  }, {});

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
        <button
          onClick={() => navigate("/overtime/register")}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Đăng ký OT
        </button>
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
          <span className="text-xs font-medium uppercase tracking-wider">Lọc nhanh</span>
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
                    <th className="p-3 border-r border-emerald-600/30">Position</th>
                    <th className="p-3 border-r border-emerald-600/30">Check in</th>
                    <th colSpan={2} className="p-3 border-r border-emerald-600/30 text-center bg-emerald-800/50">OT PLAN</th>
                    <th colSpan={2} className="p-3 border-r border-emerald-600/30 text-center bg-amber-800/50">OT RESULT</th>
                    <th className="p-3 border-r border-emerald-600/30">Reason for OT</th>
                    <th className="p-3 border-r border-emerald-600/30">Trạng thái</th>
                    <th className="p-3">Thao tác</th>
                  </tr>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b-2 border-gray-200">
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200 text-center bg-emerald-50">OT Start</th>
                    <th className="p-2 border-r border-gray-200 text-center bg-emerald-50">OT Finish</th>
                    <th className="p-2 border-r border-gray-200 text-center bg-amber-50">OT Start</th>
                    <th className="p-2 border-r border-gray-200 text-center bg-amber-50">OT Finish</th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2 border-r border-gray-200"></th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req, idx) => {
                    const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusCfg.icon;
                    const isOwner = req.user?._id === user?.id || req.user?._id === user?._id;
                    const isEditingThis = editingResult === req._id;

                    return (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-500">{(currentPage - 1) * 20 + idx + 1}</td>
                        <td className="p-3 font-semibold text-blue-700">{req.user?.idCompanny || "—"}</td>
                        <td className="p-3 font-medium text-gray-900">{req.user?.displayName || "—"}</td>
                        <td className="p-3 text-gray-600">{req.user?.department || "—"}</td>
                        <td className="p-3 text-gray-600">{req.user?.position || "—"}</td>
                        <td className="p-3 whitespace-nowrap text-gray-600">{formatDate(req.checkInDate)}</td>

                        {/* OT Plan */}
                        <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">{req.otPlanStart}</td>
                        <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">{req.otPlanFinish}</td>

                        {/* OT Result */}
                        <td className="p-3 text-center bg-amber-50/30">
                          {isEditingThis ? (
                            <input
                              type="time"
                              value={resultForm.otResultStart}
                              onChange={(e) => setResultForm((p) => ({ ...p, otResultStart: e.target.value }))}
                              className="w-[90px] p-1 border border-amber-300 rounded bg-white text-center"
                            />
                          ) : (
                            <span className={req.otResultStart ? "font-bold text-amber-800" : "text-gray-300"}>
                              {req.otResultStart || "—"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center bg-amber-50/30">
                          {isEditingThis ? (
                            <input
                              type="time"
                              value={resultForm.otResultFinish}
                              onChange={(e) => setResultForm((p) => ({ ...p, otResultFinish: e.target.value }))}
                              className="w-[90px] p-1 border border-amber-300 rounded bg-white text-center"
                            />
                          ) : (
                            <span className={req.otResultFinish ? "font-bold text-amber-800" : "text-gray-300"}>
                              {req.otResultFinish || "—"}
                            </span>
                          )}
                        </td>

                        <td className="p-3 max-w-[200px] truncate text-gray-600" title={req.reason}>{req.reason}</td>

                        <td className="p-3">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {canApprove && req.status === "PENDING" && (
                              <>
                                <button onClick={() => handleApprove(req._id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Phê duyệt"><Check className="w-4 h-4" /></button>
                                <button onClick={() => handleReject(req._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Từ chối"><X className="w-4 h-4" /></button>
                              </>
                            )}
                            {canApprove && (req.status === "APPROVED" || req.status === "COMPLETED") && !isEditingThis && (
                              <button onClick={() => startEditResult(req)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Sửa kết quả"><Edit3 className="w-4 h-4" /></button>
                            )}
                            {isEditingThis && (
                              <>
                                <button onClick={() => handleSaveResult(req._id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Lưu"><Save className="w-4 h-4" /></button>
                                <button onClick={() => setEditingResult(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors" title="Hủy"><X className="w-4 h-4" /></button>
                              </>
                            )}
                            {isOwner && req.status === "PENDING" && (
                              <button onClick={() => handleCancel(req._id)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors" title="Hủy yêu cầu"><X className="w-4 h-4" /></button>
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

// Action button component
function ActionBtn({ icon: Icon, color, title, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "transparent",
        color: color,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <Icon style={{ width: "16px", height: "16px" }} />
    </button>
  );
}

// Styles
const thStyle = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "700",
  color: "white",
  backgroundColor: "#4A7C59",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  whiteSpace: "nowrap",
  borderRight: "1px solid rgba(255,255,255,0.2)",
};

const thSubStyle = {
  padding: "6px 12px",
  textAlign: "center",
  fontSize: "11px",
  fontWeight: "600",
  color: "#374151",
  backgroundColor: "#F3F4F6",
  borderBottom: "2px solid #D1D5DB",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 12px",
  fontSize: "13px",
  color: "#374151",
  verticalAlign: "middle",
};

const timeInputStyle = {
  width: "90px",
  padding: "4px 6px",
  border: "1px solid #D1D5DB",
  borderRadius: "6px",
  fontSize: "13px",
  textAlign: "center",
};

const paginationBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  border: "1px solid #D1D5DB",
  backgroundColor: "white",
  cursor: "pointer",
  color: "#374151",
};
