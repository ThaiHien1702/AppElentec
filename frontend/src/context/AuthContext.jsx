import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextInstance";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import toast from "react-hot-toast";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [role, setRole] = useState(localStorage.getItem("userRole"));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.GET_PROFILE);
      const profile = response.data?.user || response.data;
      setUser(profile);
      if (profile?.role) {
        setRole(profile.role);
        localStorage.setItem("userRole", profile.role);
      }
    } catch {
      setUser({ token, role });
    }
  };

  // Kiểm tra xem người dùng đăng nhập khi người dùng mở
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && role) {
        await fetchCurrentUser();
      }
      setLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  // Đăng ký
  const signup = async (userData) => {
    try {
      await axiosInstance.post(API_PATHS.SIGNUP, userData);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Đăng nhập
  const signin = async (credentials) => {
    try {
      const response = await axiosInstance.post(API_PATHS.SIGNIN, credentials);
      const { accessToken, role: userRole } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userRole", userRole);

      setToken(accessToken);
      setRole(userRole);
      await fetchCurrentUser();

      toast.success("Đăng nhập thành công!");
      return { success: true, role: userRole };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Đăng xuất
  const signout = async () => {
    try {
      await axiosInstance.post(API_PATHS.SIGNOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      setToken(null);
      setRole(null);
      setUser(null);
      toast.success("Đã đăng xuất!");
    }
  };

  // Kiểm tra quyền theo vai trò
  const hasRole = (allowedRoles) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const isModerator = () => hasRole(["moderator", "admin"]);
  const isAdmin = () => hasRole(["admin"]);

  const value = {
    user,
    token,
    role,
    loading,
    signup,
    signin,
    signout,
    isAuthenticated: !!token,
    hasRole,
    isModerator,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
