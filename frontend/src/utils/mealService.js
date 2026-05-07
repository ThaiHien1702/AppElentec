import axiosInstance from "./axiosInstance";
import API_PATHS from "./apiPaths";

export const mealService = {
  // ===== Suất ăn (Catalog) =====
  getAllMeals: async (category, status) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (status) params.append("status", status);
    const query = params.toString();
    const url = query ? `${API_PATHS.MEALS_CATALOG}?${query}` : API_PATHS.MEALS_CATALOG;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getMealById: async (id) => {
    const response = await axiosInstance.get(API_PATHS.MEALS_CATALOG_BY_ID(id));
    return response.data;
  },

  createMeal: async (payload) => {
    const response = await axiosInstance.post(API_PATHS.MEALS_CATALOG, payload);
    return response.data;
  },

  updateMeal: async (id, payload) => {
    const response = await axiosInstance.put(API_PATHS.MEALS_CATALOG_BY_ID(id), payload);
    return response.data;
  },

  deleteMeal: async (id) => {
    const response = await axiosInstance.delete(API_PATHS.MEALS_CATALOG_BY_ID(id));
    return response.data;
  },

  // ===== Xuất ăn (Distribution) =====
  createDistribution: async (payload) => {
    const response = await axiosInstance.post(API_PATHS.MEALS_DISTRIBUTIONS, payload);
    return response.data;
  },

  getMyDistributions: async (status, page, limit) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    const query = params.toString();
    const url = query ? `${API_PATHS.MEALS_DISTRIBUTIONS_MY}?${query}` : API_PATHS.MEALS_DISTRIBUTIONS_MY;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getAllDistributions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.department) params.append("department", filters.department);
    if (filters.mealTime) params.append("mealTime", filters.mealTime);
    if (filters.date) params.append("date", filters.date);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    const query = params.toString();
    const url = query ? `${API_PATHS.MEALS_DISTRIBUTIONS_ALL}?${query}` : API_PATHS.MEALS_DISTRIBUTIONS_ALL;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getDistributionById: async (id) => {
    const response = await axiosInstance.get(API_PATHS.MEALS_DISTRIBUTION_BY_ID(id));
    return response.data;
  },

  confirmDistribution: async (id, notes) => {
    const response = await axiosInstance.patch(API_PATHS.MEALS_DISTRIBUTION_CONFIRM(id), { notes });
    return response.data;
  },

  serveDistribution: async (id) => {
    const response = await axiosInstance.patch(API_PATHS.MEALS_DISTRIBUTION_SERVE(id));
    return response.data;
  },

  cancelDistribution: async (id) => {
    const response = await axiosInstance.patch(API_PATHS.MEALS_DISTRIBUTION_CANCEL(id));
    return response.data;
  },

  getStats: async (from, to, department) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (department) params.append("department", department);
    const query = params.toString();
    const url = query ? `${API_PATHS.MEALS_DISTRIBUTIONS_STATS}?${query}` : API_PATHS.MEALS_DISTRIBUTIONS_STATS;
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

export default mealService;
