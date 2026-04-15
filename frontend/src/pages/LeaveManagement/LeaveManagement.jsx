import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Plus,
  Edit2,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { leaveService } from "../../utils/leaveService";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import LeaveRequestForm from "./components/LeaveRequestForm";
import LeaveRequestDetail from "./components/LeaveRequestDetail";
import LeaveStats from "./components/LeaveStats";

const LEAVE_TYPES = {
  ANNUAL: { label: "Nghỉ năm", color: "bg-green-100 text-green-800" },
  SICK: { label: "Nghỉ ốm", color: "bg-red-100 text-red-800" },
  PERSONAL: { label: "Nghỉ cá nhân", color: "bg-blue-100 text-blue-800" },
  MATERNITY: { label: "Nghỉ thai sản", color: "bg-purple-100 text-purple-800" },
  OTHER: { label: "Khác", color: "bg-gray-100 text-gray-800" },
};

const STATUS_TYPES = {
  PENDING: {
    label: "Chờ duyệt",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  CANCELLED: { label: "Đã hủy", color: "bg-gray-100 text-gray-800", icon: X },
};

export default function LeaveManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (user.role === "admin" || user.role === "moderator") {
        response = await leaveService.getAllLeaveRequests(
          filterStatus || undefined,
          undefined,
          undefined,
          currentPage,
          10,
        );
      } else {
        response = await leaveService.getMyLeaveRequests(
          filterStatus || undefined,
          currentPage,
          10,
        );
      }

      setLeaveRequests(response.leaveRequests || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách yêu cầu nghỉ phép");
    } finally {
      setLoading(false);
    }
  }, [user.role, filterStatus, currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await leaveService.getLeaveStats();
      setStats(response);
    } catch (error) {
      // Thống kê là tùy chọn
      console.error("Failed to submit leave request:", error);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
    if (user.role !== "admin" && user.role !== "moderator") {
      fetchStats();
    }
  }, [fetchLeaveRequests, fetchStats, user.role]);

  const handleCreateRequest = async (formData) => {
    try {
      await leaveService.createLeaveRequest(formData);
      handleApiSuccess("Yêu cầu nghỉ phép đã được tạo thành công");
      setShowForm(false);
      fetchLeaveRequests();
      fetchStats();
    } catch (error) {
      handleApiError(error, "Lỗi khi tạo yêu cầu nghỉ phép");
    }
  };

  const handleApproveRequest = async (id, notes) => {
    try {
      await leaveService.approveLeaveRequest(id, notes);
      handleApiSuccess("Yêu cầu nghỉ phép đã được phê duyệt");
      fetchLeaveRequests();
    } catch (error) {
      handleApiError(error, "Lỗi khi phê duyệt yêu cầu nghỉ phép");
    }
  };

  const handleRejectRequest = async (id, rejectionReason, notes) => {
    try {
      await leaveService.rejectLeaveRequest(id, rejectionReason, notes);
      handleApiSuccess("Yêu cầu nghỉ phép đã bị từ chối");
      fetchLeaveRequests();
    } catch (error) {
      handleApiError(error, "Lỗi khi từ chối yêu cầu nghỉ phép");
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu nghỉ phép này?")) return;

    try {
      await leaveService.cancelLeaveRequest(id);
      handleApiSuccess("Yêu cầu nghỉ phép đã được hủy");
      fetchLeaveRequests();
      fetchStats();
    } catch (error) {
      handleApiError(error, "Lỗi khi hủy yêu cầu nghỉ phép");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const canApprove = user.role === "admin" || user.role === "moderator";
  const canEdit = (request) =>
    request.user._id === user.id && request.status === "PENDING";

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Quản lý nghỉ phép
        </h1>
        <button
          onClick={() => navigate("/leave/register")}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo yêu cầu
        </button>
      </div>

      {/* Thống kê nghỉ phép (chỉ cho user thường) */}
      {stats && <LeaveStats stats={stats} />}

      {/* Bộ lọc */}
      <div className="mb-6">
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 w-full sm:w-64 shadow-sm">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent border-none text-sm focus:ring-0 outline-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Danh sách yêu cầu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Đang tải...</div>
        ) : leaveRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Chưa có yêu cầu nghỉ phép nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người yêu cầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại nghỉ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveRequests.map((request) => {
                    const StatusIcon = STATUS_TYPES[request.status].icon;
                    return (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.user?.displayName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.user?.department || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${LEAVE_TYPES[request.leaveType].color}`}
                          >
                            {LEAVE_TYPES[request.leaveType].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(request.startDate)} -{" "}
                          {formatDate(request.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.daysCount} ngày
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${STATUS_TYPES[request.status].color}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {STATUS_TYPES[request.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetail(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canApprove && request.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApproveRequest(request._id)
                                  }
                                  className="text-green-600 hover:text-green-900"
                                  title="Phê duyệt"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectRequest(
                                      request._id,
                                      "Không phê duyệt",
                                    )
                                  }
                                  className="text-red-600 hover:text-red-900"
                                  title="Từ chối"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {canEdit(request) && (
                              <button
                                onClick={() => handleCancelRequest(request._id)}
                                className="text-gray-600 hover:text-gray-900"
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

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Trang <span className="font-medium">{currentPage}</span>{" "}
                      trên <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ›
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal tạo yêu cầu */}
      {showForm && (
        <LeaveRequestForm
          onSubmit={handleCreateRequest}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Modal chi tiết yêu cầu */}
      {showDetail && selectedRequest && (
        <LeaveRequestDetail
          request={selectedRequest}
          onClose={() => {
            setShowDetail(false);
            setSelectedRequest(null);
          }}
          onApprove={canApprove ? handleApproveRequest : null}
          onReject={canApprove ? handleRejectRequest : null}
          onCancel={canEdit(selectedRequest) ? handleCancelRequest : null}
        />
      )}
    </div>
  );
}
