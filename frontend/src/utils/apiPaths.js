import { getApiBaseUrl } from "./apiBaseUrl";

const BASE_URL = getApiBaseUrl();

export const API_PATHS = {
  // Các điểm cuối xác thực
  SIGNUP: `${BASE_URL}/auth/signup`,
  SIGNIN: `${BASE_URL}/auth/signin`,
  SIGNOUT: `${BASE_URL}/auth/signout`,

  // Các điểm cuối hồ sơ
  GET_PROFILE: `${BASE_URL}/auth/profile`,
  UPDATE_PROFILE: `${BASE_URL}/auth/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,

  // Các điểm cuối Moderator
  MODERATOR_USERS: `${BASE_URL}/auth/moderator/users`,
  MODERATOR_USER_BY_ID: (userId) =>
    `${BASE_URL}/auth/moderator/users/${userId}`,
  MODERATOR_USERS_BY_ROLE: (role) =>
    `${BASE_URL}/auth/moderator/users/role/${role}`,

  // Các điểm cuối Admin
  ADMIN_ASSIGN_ROLE: `${BASE_URL}/auth/admin/assign-role`,
  ADMIN_REMOVE_ROLE: `${BASE_URL}/auth/admin/remove-role`,
  ADMIN_CREATE_USER: `${BASE_URL}/auth/admin/create-user`,
  ADMIN_DELETE_USER: `${BASE_URL}/auth/admin/delete-user`,
  ADMIN_ALL_USERS: `${BASE_URL}/auth/admin/all-users`,
  ADMIN_USER_BY_ID: (userId) => `${BASE_URL}/auth/admin/users/${userId}`,
  ADMIN_UPDATE_USER_BY_ID: (userId) => `${BASE_URL}/auth/admin/users/${userId}`,
  ADMIN_USERS_BY_ROLE: (role) => `${BASE_URL}/auth/admin/users/role/${role}`,

  // Các điểm cuối phòng ban
  DEPARTMENTS: `${BASE_URL}/departments`,
  DEPARTMENT_BY_ID: (id) => `${BASE_URL}/departments/${id}`,
  DEPARTMENT_USERS: (id) => `${BASE_URL}/departments/${id}/users`,
  DEPARTMENT_ADD_USER: (id) => `${BASE_URL}/departments/${id}/users/add`,
  DEPARTMENT_REMOVE_USER: (id) => `${BASE_URL}/departments/${id}/users/remove`,
  DEPARTMENT_TOGGLE_STATUS: (id) =>
    `${BASE_URL}/departments/${id}/toggle-status`,

  // Các điểm cuối users
  USERS: `${BASE_URL}/users`,

  // Các điểm cuối quản lý máy tính
  COMPUTERS: `${BASE_URL}/computers`,
  COMPUTER_BY_ID: (id) => `${BASE_URL}/computers/${id}`,
  COMPUTERS_SEARCH: (keyword) => `${BASE_URL}/computers/search?q=${keyword}`,
  COMPUTERS_IMPORT: `${BASE_URL}/computers/import`,
  COMPUTERS_TEMPLATE: `${BASE_URL}/computers/template`,
  COMPUTERS_EXPORT: (department, status) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (status) params.append("status", status);

    const query = params.toString();
    return query
      ? `${BASE_URL}/computers/export?${query}`
      : `${BASE_URL}/computers/export`;
  },
  COMPUTERS_WITH_FILTERS: (department, status) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (status) params.append("status", status);

    const query = params.toString();
    return query ? `${BASE_URL}/computers?${query}` : `${BASE_URL}/computers`;
  },

  // Access control endpoints
  VISITORS: `${BASE_URL}/visitors`,
  VISITOR_BY_ID: (id) => `${BASE_URL}/visitors/${id}`,

  VEHICLES: `${BASE_URL}/vehicles`,
  VEHICLE_BY_ID: (id) => `${BASE_URL}/vehicles/${id}`,

  VISITS: `${BASE_URL}/visits`,
  VISIT_BY_ID: (id) => `${BASE_URL}/visits/${id}`,
  VISIT_SUBMIT: (id) => `${BASE_URL}/visits/${id}/submit`,
  VISIT_CANCEL: (id) => `${BASE_URL}/visits/${id}/cancel`,

  APPROVAL_INBOX: `${BASE_URL}/approvals/inbox`,
  APPROVE_REQUEST: (requestId) => `${BASE_URL}/approvals/${requestId}/approve`,
  REJECT_REQUEST: (requestId) => `${BASE_URL}/approvals/${requestId}/reject`,

  GATE_VERIFY_QR: `${BASE_URL}/gate/verify-qr`,
  GATE_CHECK_IN: `${BASE_URL}/gate/check-in`,
  GATE_CHECK_OUT: `${BASE_URL}/gate/check-out`,
  GATE_MANUAL_DENY: `${BASE_URL}/gate/manual-deny`,
  GATE_CARDS: `${BASE_URL}/gate/cards`,
  GATE_REGISTER_CARD: `${BASE_URL}/gate/cards`,
  GATE_TOGGLE_CARD: `${BASE_URL}/gate/cards/toggle`,
  // Luggage management endpoints
  LUGGAGE_ADD: `${BASE_URL}/luggage`,
  LUGGAGE_LIST: `${BASE_URL}/luggage`,
  LUGGAGE_BY_VISIT: (visitId) => `${BASE_URL}/luggage/visit/${visitId}`,
  LUGGAGE_BY_ID: (id) => `${BASE_URL}/luggage/${id}`,
  LUGGAGE_CHECKOUT: (id) => `${BASE_URL}/luggage/${id}/checkout`,
  LUGGAGE_UPDATE_STATUS: (id) => `${BASE_URL}/luggage/${id}/status`,
  LUGGAGE_DELETE: (id) => `${BASE_URL}/luggage/${id}`,
  LUGGAGE_STATS: `${BASE_URL}/luggage/stats/summary`,
  LUGGAGE_WITH_FILTERS: (status, visitId, itemType, page, limit) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (visitId) params.append("visitRequestId", visitId);
    if (itemType) params.append("itemType", itemType);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    const query = params.toString();
    return query ? `${BASE_URL}/luggage?${query}` : `${BASE_URL}/luggage`;
  },
  REPORT_REALTIME: `${BASE_URL}/reports/realtime`,
  REPORT_DAILY: `${BASE_URL}/reports/daily`,
  REPORT_OVERDUE: `${BASE_URL}/reports/overdue`,
  REPORT_EXPORT: (type = "excel", from = "", to = "") => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    return `${BASE_URL}/reports/export?${params.toString()}`;
  },

  ACCESS_POLICIES: `${BASE_URL}/access-control/policies`,
  ACCESS_POLICY_TOGGLE: (id) =>
    `${BASE_URL}/access-control/policies/${id}/toggle`,
};

export default API_PATHS;
