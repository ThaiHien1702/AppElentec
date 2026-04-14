import axiosInstance from "./axiosInstance";
import API_PATHS from "./apiPaths";

export const leaveService = {
  // Tạo yêu cầu nghỉ phép mới
  createLeaveRequest: async (payload) => {
    const response = await axiosInstance.post(API_PATHS.LEAVES, payload);
    return response.data;
  },

  // Lấy danh sách yêu cầu nghỉ phép của tôi
  getMyLeaveRequests: async (status, page, limit) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const query = params.toString();
    const url = query ? `${API_PATHS.LEAVES_MY}?${query}` : API_PATHS.LEAVES_MY;

    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Lấy tất cả yêu cầu nghỉ phép (admin/moderator)
  getAllLeaveRequests: async (status, user, leaveType, page, limit) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (user) params.append("user", user);
    if (leaveType) params.append("leaveType", leaveType);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const query = params.toString();
    const url = query ? `${API_PATHS.LEAVES_ALL}?${query}` : API_PATHS.LEAVES_ALL;

    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Lấy chi tiết yêu cầu nghỉ phép
  getLeaveRequestById: async (id) => {
    const response = await axiosInstance.get(API_PATHS.LEAVES_BY_ID(id));
    return response.data;
  },

  // Cập nhật yêu cầu nghỉ phép
  updateLeaveRequest: async (id, payload) => {
    const response = await axiosInstance.put(
      API_PATHS.LEAVES_UPDATE(id),
      payload,
    );
    return response.data;
  },

  // Hủy yêu cầu nghỉ phép
  cancelLeaveRequest: async (id) => {
    const response = await axiosInstance.patch(API_PATHS.LEAVES_CANCEL(id));
    return response.data;
  },

  // Phê duyệt yêu cầu nghỉ phép (admin/moderator)
  approveLeaveRequest: async (id, notes) => {
    const response = await axiosInstance.patch(API_PATHS.LEAVES_APPROVE(id), {
      notes,
    });
    return response.data;
  },

  // Từ chối yêu cầu nghỉ phép (admin/moderator)
  rejectLeaveRequest: async (id, rejectionReason, notes) => {
    const response = await axiosInstance.patch(API_PATHS.LEAVES_REJECT(id), {
      rejectionReason,
      notes,
    });
    return response.data;
  },

  // Lấy thống kê nghỉ phép
  getLeaveStats: async () => {
    const response = await axiosInstance.get(API_PATHS.LEAVES_STATS);
    return response.data;
  },
};

export default leaveService;
