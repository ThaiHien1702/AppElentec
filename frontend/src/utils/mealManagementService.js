import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/api/meals";
const DISTRIBUTION_URL = "/api/distributions";
const INVENTORY_URL = "/api/inventory";

// ===== MEALS API =====
export const mealService = {
  // Lấy danh sách suất ăn
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await axiosInstance.get(
        `${API_BASE_URL}?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết suất ăn
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo suất ăn mới
  create: async (mealData) => {
    try {
      const response = await axiosInstance.post(API_BASE_URL, mealData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật suất ăn
  update: async (id, mealData) => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/${id}`,
        mealData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trạng thái
  updateStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa suất ăn
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy suất ăn theo danh mục
  getByCategory: async (category) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/category/${category}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ===== MEAL DISTRIBUTIONS API =====
export const mealDistributionService = {
  // Lấy danh sách xuất ăn
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append("date", filters.date);
      if (filters.employee_id)
        params.append("employee_id", filters.employee_id);
      if (filters.department_id)
        params.append("department_id", filters.department_id);
      if (filters.status) params.append("status", filters.status);

      const response = await axiosInstance.get(
        `${DISTRIBUTION_URL}?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết xuất ăn
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`${DISTRIBUTION_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo xuất ăn mới
  create: async (distributionData) => {
    try {
      const response = await axiosInstance.post(
        DISTRIBUTION_URL,
        distributionData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật xuất ăn
  update: async (id, distributionData) => {
    try {
      const response = await axiosInstance.put(
        `${DISTRIBUTION_URL}/${id}`,
        distributionData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xác nhận xuất ăn
  confirm: async (id) => {
    try {
      const response = await axiosInstance.put(
        `${DISTRIBUTION_URL}/${id}/confirm`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trạng thái
  updateStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(
        `${DISTRIBUTION_URL}/${id}/status`,
        { status },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa xuất ăn
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`${DISTRIBUTION_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy xuất ăn của nhân viên theo ngày
  getByEmployeeAndDate: async (employeeId, date) => {
    try {
      const response = await axiosInstance.get(
        `${DISTRIBUTION_URL}/by-employee/${employeeId}/${date}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy tổng xuất ăn theo ngày
  getStatsByDate: async (date) => {
    try {
      const response = await axiosInstance.get(
        `${DISTRIBUTION_URL}/stats/date/${date}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy tổng xuất ăn theo tháng
  getStatsByMonth: async (year, month) => {
    try {
      const response = await axiosInstance.get(
        `${DISTRIBUTION_URL}/stats/month/${year}/${month}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy tổng xuất ăn theo phòng ban
  getStatsByDepartment: async (date = null) => {
    try {
      const params = new URLSearchParams();
      if (date) params.append("date", date);

      const response = await axiosInstance.get(
        `${DISTRIBUTION_URL}/stats/department?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ===== MEAL INVENTORY API =====
export const mealInventoryService = {
  // Lấy danh sách tồn kho
  getAll: async () => {
    try {
      const response = await axiosInstance.get(INVENTORY_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết tồn kho
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`${INVENTORY_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo tồn kho mới
  create: async (inventoryData) => {
    try {
      const response = await axiosInstance.post(INVENTORY_URL, inventoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật tồn kho
  update: async (id, inventoryData) => {
    try {
      const response = await axiosInstance.put(
        `${INVENTORY_URL}/${id}`,
        inventoryData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Nhập kho
  import: async (id, quantity) => {
    try {
      const response = await axiosInstance.post(
        `${INVENTORY_URL}/${id}/import`,
        { quantity },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xuất kho
  export: async (id, quantity) => {
    try {
      const response = await axiosInstance.post(
        `${INVENTORY_URL}/${id}/export`,
        { quantity },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách tồn kho thấp
  getLowStock: async () => {
    try {
      const response = await axiosInstance.get(`${INVENTORY_URL}/low-stock`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy số lượng có sẵn
  getAvailableQuantity: async (mealId) => {
    try {
      const response = await axiosInstance.get(
        `${INVENTORY_URL}/available/${mealId}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa tồn kho
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`${INVENTORY_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default {
  mealService,
  mealDistributionService,
  mealInventoryService,
};
