import axios from "axios";
import { getApiBaseUrl } from "./apiBaseUrl";

// Access token is kept in memory only (never in localStorage) so that an XSS
// payload cannot read it from persistent storage. The long-lived refresh token
// lives in an httpOnly cookie that JS cannot access at all.
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // gửi cookie refreshToken
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - gắn access token (từ memory) vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Dùng chung một promise refresh để nhiều request 401 đồng thời chỉ gọi
// /auth/refresh một lần.
let refreshPromise = null;

// Gọi /auth/refresh bằng axios "trần" (không qua interceptor) để tránh đệ quy.
export const tryRefreshToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${getApiBaseUrl()}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const newToken = res.data?.accessToken || null;
        setAccessToken(newToken);
        return { token: newToken, role: res.data?.role || null };
      })
      .catch((error) => {
        setAccessToken(null);
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const clearSessionAndRedirect = () => {
  setAccessToken(null);
  localStorage.removeItem("userRole");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Response interceptor - tự làm mới token khi gặp 401 rồi thử lại request
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    // Không tự refresh cho chính các endpoint auth (tránh vòng lặp).
    const isAuthEndpoint =
      url.includes("/auth/refresh") ||
      url.includes("/auth/signin") ||
      url.includes("/auth/signup");

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const { token } = await tryRefreshToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch {
        // refresh thất bại -> đăng xuất bên dưới
      }
      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
