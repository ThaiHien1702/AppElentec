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
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a1a2e",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: 0,
            }}
          >
            <Clock style={{ width: "28px", height: "28px", color: "#2563EB" }} />
            Đăng ký giờ làm thêm (OT)
          </h1>
          <p style={{ color: "#6B7280", marginTop: "4px", fontSize: "14px" }}>
            Quản lý và theo dõi đăng ký giờ làm thêm
          </p>
        </div>
        <button
          onClick={() => navigate("/overtime/register")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            backgroundColor: "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1D4ED8")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#2563EB")}
        >
          <Plus style={{ width: "18px", height: "18px" }} />
          Đăng ký OT
        </button>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = requests.filter((r) => r.status === key).length;
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              style={{
                backgroundColor: cfg.bg,
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Icon style={{ width: "20px", height: "20px", color: cfg.color }} />
              <div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: cfg.color }}>
                  {count}
                </div>
                <div style={{ fontSize: "12px", color: cfg.color, opacity: 0.8 }}>
                  {cfg.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <Filter style={{ width: "16px", height: "16px", color: "#6B7280" }} />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #D1D5DB",
            fontSize: "14px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="COMPLETED">Hoàn thành</option>
        </select>
        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>
          Tổng: {totalItems} yêu cầu
        </span>
      </div>

      {/* Table - Excel style */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>
            <Clock
              style={{
                width: "32px",
                height: "32px",
                margin: "0 auto 12px",
                animation: "spin 1s linear infinite",
              }}
            />
            Đang tải...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>
            <AlertCircle
              style={{ width: "40px", height: "40px", margin: "0 auto 12px" }}
            />
            <p>Chưa có yêu cầu OT nào</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>No.</th>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Dept</th>
                    <th style={thStyle}>Position</th>
                    <th style={thStyle}>Check in</th>
                    <th
                      colSpan={2}
                      style={{
                        ...thStyle,
                        backgroundColor: "#4A7C59",
                        textAlign: "center",
                      }}
                    >
                      OT PLAN
                    </th>
                    <th
                      colSpan={2}
                      style={{
                        ...thStyle,
                        backgroundColor: "#8B6914",
                        textAlign: "center",
                      }}
                    >
                      OT RESULT
                    </th>
                    <th style={thStyle}>Reason for OT</th>
                    <th style={thStyle}>Trạng thái</th>
                    <th style={thStyle}>Thao tác</th>
                  </tr>
                  <tr>
                    <th style={thSubStyle}></th>
                    <th style={thSubStyle}></th>
                    <th style={thSubStyle}></th>
                    <th style={thSubStyle}></th>
                    <th style={thSubStyle}></th>
                    <th style={thSubStyle}></th>
                    <th style={{ ...thSubStyle, backgroundColor: "#EBF5EE" }}>
                      OT Start (Hr)
                    </th>
                    <th style={{ ...thSubStyle, backgroundColor: "#EBF5EE" }}>
                      OT Finish (Hr)
                    </th>
                    <th style={{ ...thSubStyle, backgroundColor: "#FFF8E1" }}>
                      OT Start (Hr)
                    </th>
                    <th style={{ ...thSubStyle, backgroundColor: "#FFF8E1" }}>
                      OT Finish (Hr)
                    </th>
                    <th style={thSubStyle}></th>
                    <th style={thSubStyle}></th>
                    <th style={thSubStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, idx) => {
                    const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusCfg.icon;
                    const isOwner =
                      req.user?._id === user?.id ||
                      req.user?._id === user?._id;
                    const isEditingThis = editingResult === req._id;

                    return (
                      <tr
                        key={req._id}
                        style={{
                          borderBottom: "1px solid #E5E7EB",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#F9FAFB")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <td style={tdStyle}>{(currentPage - 1) * 20 + idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: "600", color: "#1E40AF" }}>
                          {req.user?.idCompanny || "—"}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: "500" }}>
                          {req.user?.displayName || "—"}
                        </td>
                        <td style={tdStyle}>{req.user?.department || "—"}</td>
                        <td style={tdStyle}>{req.user?.position || "—"}</td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {formatDate(req.checkInDate)}
                        </td>

                        {/* OT Plan */}
                        <td
                          style={{
                            ...tdStyle,
                            backgroundColor: "#F0FFF4",
                            textAlign: "center",
                            fontWeight: "600",
                          }}
                        >
                          {req.otPlanStart}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            backgroundColor: "#F0FFF4",
                            textAlign: "center",
                            fontWeight: "600",
                          }}
                        >
                          {req.otPlanFinish}
                        </td>

                        {/* OT Result */}
                        <td
                          style={{
                            ...tdStyle,
                            backgroundColor: "#FFFBEB",
                            textAlign: "center",
                          }}
                        >
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
                              style={timeInputStyle}
                            />
                          ) : (
                            <span style={{ fontWeight: req.otResultStart ? "600" : "400", color: req.otResultStart ? "#92400E" : "#D1D5DB" }}>
                              {req.otResultStart || "—"}
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            backgroundColor: "#FFFBEB",
                            textAlign: "center",
                          }}
                        >
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
                              style={timeInputStyle}
                            />
                          ) : (
                            <span style={{ fontWeight: req.otResultFinish ? "600" : "400", color: req.otResultFinish ? "#92400E" : "#D1D5DB" }}>
                              {req.otResultFinish || "—"}
                            </span>
                          )}
                        </td>

                        {/* Reason */}
                        <td
                          style={{
                            ...tdStyle,
                            maxWidth: "220px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={req.reason}
                        >
                          {req.reason}
                        </td>

                        {/* Status */}
                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: "600",
                              backgroundColor: statusCfg.bg,
                              color: statusCfg.color,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <StatusIcon style={{ width: "12px", height: "12px" }} />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                            {/* Admin: Approve/Reject PENDING */}
                            {canApprove && req.status === "PENDING" && (
                              <>
                                <ActionBtn
                                  icon={Check}
                                  color="#059669"
                                  title="Phê duyệt"
                                  onClick={() => handleApprove(req._id)}
                                />
                                <ActionBtn
                                  icon={X}
                                  color="#DC2626"
                                  title="Từ chối"
                                  onClick={() => handleReject(req._id)}
                                />
                              </>
                            )}

                            {/* Admin: Edit OT Result for APPROVED */}
                            {canApprove &&
                              (req.status === "APPROVED" || req.status === "COMPLETED") &&
                              !isEditingThis && (
                                <ActionBtn
                                  icon={Edit3}
                                  color="#D97706"
                                  title="Nhập kết quả OT"
                                  onClick={() => startEditResult(req)}
                                />
                              )}

                            {/* Save result */}
                            {isEditingThis && (
                              <>
                                <ActionBtn
                                  icon={Save}
                                  color="#059669"
                                  title="Lưu kết quả"
                                  onClick={() => handleSaveResult(req._id)}
                                />
                                <ActionBtn
                                  icon={X}
                                  color="#6B7280"
                                  title="Hủy"
                                  onClick={() => {
                                    setEditingResult(null);
                                    setResultForm({
                                      otResultStart: "",
                                      otResultFinish: "",
                                    });
                                  }}
                                />
                              </>
                            )}

                            {/* Owner: Cancel PENDING */}
                            {isOwner && req.status === "PENDING" && (
                              <ActionBtn
                                icon={X}
                                color="#6B7280"
                                title="Hủy yêu cầu"
                                onClick={() => handleCancel(req._id)}
                              />
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 20px",
                  borderTop: "1px solid #E5E7EB",
                }}
              >
                <span style={{ fontSize: "13px", color: "#6B7280" }}>
                  Trang {currentPage} / {totalPages}
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={paginationBtnStyle}
                  >
                    <ChevronLeft style={{ width: "16px", height: "16px" }} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={paginationBtnStyle}
                  >
                    <ChevronRight style={{ width: "16px", height: "16px" }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
