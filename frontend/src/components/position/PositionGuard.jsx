import React, { useState, useEffect } from "react";
import usePosition from "../../hooks/usePosition";
import { AlertCircle } from "lucide-react";

/**
 * PositionGuard - Conditionally render content based on user's position/permissions
 *
 * Usage:
 * <PositionGuard permission="canManageUsers">
 *   <AdminPanel />
 * </PositionGuard>
 *
 * Or with fallback:
 * <PositionGuard
 *   permission="canDeleteData"
 *   fallback={<p>Bạn không có quyền xóa dữ liệu</p>}
 * >
 *   <DeleteButton />
 * </PositionGuard>
 */
export default function PositionGuard({
  permission,
  children,
  fallback = null,
  showMessage = false,
}) {
  const { hasPermission } = usePosition();
  const [allowed, setAllowed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await hasPermission(permission);
        setAllowed(result);
      } catch (error) {
        console.error("Error checking permission:", error);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [permission, hasPermission]);

  if (loading) {
    return null;
  }

  if (!allowed) {
    if (fallback) {
      return fallback;
    }

    if (showMessage) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          <span>Bạn không có quyền thực hiện hành động này</span>
        </div>
      );
    }

    return null;
  }

  return children;
}

/**
 * PositionBadge - Display user's position
 */
export function PositionBadge() {
  const { fetchPositionInfo } = usePosition();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const loadPosition = async () => {
      const info = await fetchPositionInfo();
      if (info) {
        setPosition(info.user.position);
      }
    };
    loadPosition();
  }, [fetchPositionInfo]);

  if (!position) return null;

  const colors = {
    Manager: "bg-red-100 text-red-800",
    "Assistant Manager": "bg-orange-100 text-orange-800",
    Supervisor: "bg-blue-100 text-blue-800",
    Staff: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${colors[position] || "bg-gray-100 text-gray-800"}`}
    >
      {position}
    </span>
  );
}

/**
 * PermissionsList - Display all user permissions
 */
export function PermissionsList() {
  const { fetchPositionInfo } = usePosition();
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const loadPermissions = async () => {
      const info = await fetchPositionInfo();
      if (info) {
        setPermissions(info.permissions);
      }
    };
    loadPermissions();
  }, [fetchPositionInfo]);

  if (!permissions) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold mb-3 text-gray-900">Quyền của bạn</h3>
      <ul className="space-y-2">
        {Object.entries(permissions).map(([key, value]) => (
          <li key={key} className="flex items-center gap-2">
            <span
              className={`w-4 h-4 rounded ${value ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className="text-sm text-gray-700">
              {formatPermissionName(key)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Helper function to format permission names
 */
function formatPermissionName(key) {
  const names = {
    canManageAllUsers: "Quản lý tất cả người dùng",
    canManagePositions: "Quản lý cấp bậc",
    canViewReports: "Xem báo cáo",
    canDeleteData: "Xóa dữ liệu",
    canExportData: "Xuất dữ liệu",
    canImportData: "Nhập dữ liệu",
    canEditAllComputers: "Chỉnh sửa tất cả máy tính",
  };
  return names[key] || key;
}
