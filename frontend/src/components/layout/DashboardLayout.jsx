import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ProfileDropdown from "./ProfileDropdown";
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Monitor,
  ClipboardList,
  ScanLine,
  CheckCheck,
  BarChart3,
  Package,
  Calendar,
  Plus,
  Box,
  Clock,
} from "lucide-react";

const DashboardLayout = ({ children }) => {
  const { role, user, isAdmin, isModerator } = useAuth();
  const location = useLocation();
  const canAccessManagement = isModerator() || isAdmin();
  const currentDepartmentLabel = user?.department || "Chưa được gán";

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Tổ chức các mục menu thành các phần
  const menuSections = [
    {
      title: "Tổng quan",
      items: [
        {
          name: `Bộ Phận - ${currentDepartmentLabel}`,
          path: "/dashboard",
          icon: LayoutDashboard,
          show: true,
        },
        {
          name: "Departments",
          path: "/departments",
          icon: Building2,
          show: role === "moderator",
        },
        {
          name: "Đăng ký ra/vào cổng",
          path: "/access/requests",
          icon: ClipboardList,
          show: role === "user",
        },
      ],
    },
    {
      title: "Quản lý",
      items: [
        {
          name: "Departments",
          path: "/departments",
          icon: Building2,
          show: isAdmin(), // Admin sẽ thấy Departments ở phần Quản lý
        },
        {
          name: "Quản lý máy tính",
          path: "/it/computers",
          icon: Monitor,
          show: isAdmin(),
        },
        {
          name: "Admin Panel",
          path: "/admin",
          icon: ShieldCheck,
          show: isAdmin(),
        },
      ],
    },
    {
      title: "Quản lý Truy cập",
      items: [
        {
          name: "Đăng ký ra/vào cổng",
          path: "/access/requests",
          icon: ClipboardList,
          show: canAccessManagement,
        },
        {
          name: "Check-in/Check-out",
          path: "/access/gate",
          icon: ScanLine,
          show: canAccessManagement,
        },
        {
          name: "Phê duyệt yêu cầu",
          path: "/access/approvals",
          icon: CheckCheck,
          show: canAccessManagement,
        },
      ],
    },
    {
      title: "Kho Hàng",
      items: [
        {
          name: "Quản lý đồ đạc",
          path: "/luggage",
          icon: Box,
          show: canAccessManagement,
        },
        {
          name: "Ghi nhận vật dụng",
          path: "/luggage/register",
          icon: Plus,
          show: canAccessManagement,
        },
      ],
    },
    {
      title: "Nhân sự",
      items: [
        {
          name: "Quản lý nghỉ phép",
          path: "/leave",
          icon: Calendar,
          show: true, // Tất cả user đều có thể truy cập
        },
        {
          name: "Đăng ký nghỉ phép",
          path: "/leave/register",
          icon: Plus,
          show: true,
        },
        {
          name: "Đăng ký giờ làm thêm",
          path: "/overtime",
          icon: Clock,
          show: true,
        },
        {
          name: "Đăng ký OT mới",
          path: "/overtime/register",
          icon: Plus,
          show: true,
        },
      ],
    },
  ];

  const getRoleBadgeColor = () => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      case "moderator":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getPageTitle = () => {
    const currentItem = menuSections
      .flatMap((section) => section.items)
      .find((item) => item.path === location.pathname);
    return currentItem ? currentItem.name : "Departments";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Thanh bên */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-10 border-r border-gray-200">
        {/* Phần Logo/Thương hiệu */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Elentec System
          </h2>
          <div className="mt-3">
            <span
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${getRoleBadgeColor()}`}
            >
              {role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Menu Điều hướng */}
        <nav className="mt-4 px-3 overflow-y-auto h-[calc(100vh-140px)]">
          {menuSections.map((section) => {
            const visibleItems = section.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mr-3 ${
                            active ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                        <span>{item.name}</span>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Nội dung chính */}
      <div className="ml-64 min-h-screen">
        {/* Thanh trên cùng */}
        <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {user?.displayName || user?.idCompanny || user?.username}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Phòng ban: {user?.department || "Chưa được gán"}
              </p>
            </div>
            <ProfileDropdown />
          </div>
        </header>

        {/* Nội dung trang */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
