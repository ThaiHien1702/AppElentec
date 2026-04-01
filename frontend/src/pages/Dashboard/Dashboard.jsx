import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";
import {
  Shield,
  ShieldCheck,
  Users,
  Crown,
  Building2,
  Activity,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const Dashboard = () => {
  const { role, user, isModerator, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      if (isModerator()) {
        const usersResponse = await axiosInstance.get(
          API_PATHS.ADMIN_ALL_USERS,
        );
        setStats((prev) => ({
          ...prev,
          totalUsers: usersResponse.data.length,
        }));
      }
    } catch (error) {
      handleApiError(error, "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Crown className="w-8 h-8 text-red-600" />;
      case "moderator":
        return <ShieldCheck className="w-8 h-8 text-purple-600" />;
      default:
        return <Users className="w-8 h-8 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderator":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: loading ? "..." : stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      show: isModerator(),
    },
    {
      title: "Departments",
      value: loading ? "..." : stats.totalDepartments,
      icon: Building2,
      color: "bg-green-500",
      show: true,
    },
    {
      title: "Your Role",
      value: role,
      icon: Shield,
      color: "bg-purple-500",
      show: true,
    },
  ];

  const permissionsList = [
    {
      text: "Truy cập profile cá nhân",
      icon: CheckCircle2,
      color: "text-green-600",
      show: true,
    },
    {
      text: "Xem danh sách departments",
      icon: CheckCircle2,
      color: "text-green-600",
      show: true,
    },
    {
      text: "Xem danh sách tất cả users",
      icon: CheckCircle2,
      color: "text-blue-600",
      show: isModerator(),
    },
    {
      text: "Phân quyền và quản lý users",
      icon: CheckCircle2,
      color: "text-purple-600",
      show: isAdmin(),
    },
    {
      text: "Xóa users và gán role",
      icon: CheckCircle2,
      color: "text-red-600",
      show: isAdmin(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Thẻ chào mừng */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              {getRoleIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Xin chào,{" "}
                {user?.displayName || user?.idCompanny || user?.username}!
              </h1>
              <p className="text-blue-100">
                Chào mừng bạn đến với hệ thống quản lý
              </p>
              <p className="text-blue-100/90 text-sm mt-1">
                Phòng ban hiện tại: {user?.department || "Chưa được gán"}
              </p>
            </div>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 bg-white ${getRoleBadgeColor()}`}
            >
              {role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards
          .filter((stat) => stat.show)
          .map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Bố cục hai cột */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thẻ quyền */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Quyền của bạn
            </h2>
          </div>
          <div className="space-y-3">
            {permissionsList
              .filter((perm) => perm.show)
              .map((perm, index) => {
                const Icon = perm.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${perm.color}`} />
                    <span className="text-gray-700">{perm.text}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Thẻ trạng thái hệ thống */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Trạng thái hệ thống
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Server Status</span>
              <span className="flex items-center text-green-600 font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database</span>
              <span className="flex items-center text-green-600 font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Last Update</span>
              <span className="text-gray-600 font-medium">
                {new Date().toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mẹo nhanh */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Mẹo sử dụng
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Sử dụng menu bên trái để điều hướng giữa các trang</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Cập nhật thông tin profile của bạn trong trang Profile
                </span>
              </li>
              {isAdmin() && (
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Sử dụng Admin Panel để quản lý users và phân quyền
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
