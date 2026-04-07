import axiosInstance from "./axiosInstance";
import API_PATHS from "./apiPaths";

export const luggageService = {
  // Thêm hành lý
  addLuggage: async (payload) => {
    const response = await axiosInstance.post(API_PATHS.LUGGAGE_ADD, payload);
    return response.data;
  },

  // Lấy danh sách hành lý theo visit
  getLuggageByVisit: async (visitId) => {
    const response = await axiosInstance.get(
      API_PATHS.LUGGAGE_BY_VISIT(visitId),
    );
    return response.data;
  },

  // Lấy tất cả hành lý (với bộ lọc)
  getAllLuggage: async (status, visitId, itemType, page, limit) => {
    const response = await axiosInstance.get(
      API_PATHS.LUGGAGE_WITH_FILTERS(status, visitId, itemType, page, limit),
    );
    return response.data;
  },

  // Check-out hành lý
  checkOutLuggage: async (luggageId, payload) => {
    const response = await axiosInstance.patch(
      API_PATHS.LUGGAGE_CHECKOUT(luggageId),
      payload,
    );
    return response.data;
  },

  // Cập nhật trạng thái hành lý
  updateLuggageStatus: async (luggageId, payload) => {
    const response = await axiosInstance.patch(
      API_PATHS.LUGGAGE_UPDATE_STATUS(luggageId),
      payload,
    );
    return response.data;
  },

  // Xóa hành lý
  deleteLuggage: async (luggageId) => {
    const response = await axiosInstance.delete(
      API_PATHS.LUGGAGE_DELETE(luggageId),
    );
    return response.data;
  },

  // Lấy thống kê hành lý
  getLuggageStats: async () => {
    const response = await axiosInstance.get(API_PATHS.LUGGAGE_STATS);
    return response.data;
  },
};

export default luggageService;
