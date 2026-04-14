import axiosInstance from "./axiosInstance";
import API_PATHS from "./apiPaths";

export const overtimeService = {
  // Tạo yêu cầu OT mới
  createOvertimeRequest: async (payload) => {
    const response = await axiosInstance.post(API_PATHS.OVERTIME, payload);
    return response.data;
  },

  // Lấy danh sách OT của tôi
  getMyOvertimeRequests: async (status, page, limit) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const query = params.toString();
    const url = query
      ? `${API_PATHS.OVERTIME_MY}?${query}`
      : API_PATHS.OVERTIME_MY;

    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Lấy tất cả OT (admin/moderator)
  getAllOvertimeRequests: async (status, user, from, to, page, limit) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (user) params.append("user", user);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const query = params.toString();
    const url = query
      ? `${API_PATHS.OVERTIME_ALL}?${query}`
      : API_PATHS.OVERTIME_ALL;

    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Lấy chi tiết OT
  getOvertimeById: async (id) => {
    const response = await axiosInstance.get(API_PATHS.OVERTIME_BY_ID(id));
    return response.data;
  },

  // Cập nhật OT
  updateOvertimeRequest: async (id, payload) => {
    const response = await axiosInstance.put(
      API_PATHS.OVERTIME_UPDATE(id),
      payload,
    );
    return response.data;
  },

  // Hủy OT
  cancelOvertimeRequest: async (id) => {
    const response = await axiosInstance.patch(API_PATHS.OVERTIME_CANCEL(id));
    return response.data;
  },

  // Phê duyệt OT
  approveOvertimeRequest: async (id, notes) => {
    const response = await axiosInstance.patch(
      API_PATHS.OVERTIME_APPROVE(id),
      { notes },
    );
    return response.data;
  },

  // Từ chối OT
  rejectOvertimeRequest: async (id, rejectionReason, notes) => {
    const response = await axiosInstance.patch(
      API_PATHS.OVERTIME_REJECT(id),
      { rejectionReason, notes },
    );
    return response.data;
  },

  // Cập nhật kết quả OT (admin/moderator)
  updateOvertimeResult: async (id, payload) => {
    const response = await axiosInstance.patch(
      API_PATHS.OVERTIME_RESULT(id),
      payload,
    );
    return response.data;
  },

  // Thống kê OT
  getOvertimeStats: async () => {
    const response = await axiosInstance.get(API_PATHS.OVERTIME_STATS);
    return response.data;
  },
};

export default overtimeService;
