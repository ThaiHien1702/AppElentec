import { useCallback } from "react";
import useAuth from "./useAuth";

/**
 * Hook để kiểm tra vị trí và quyền hạn của người dùng
 * Lấy thông tin vị trí từ API
 */
export default function usePosition() {
  const { token } = useAuth();

  const fetchPositionInfo = useCallback(async () => {
    try {
      if (!token) return null;

      const response = await fetch("/api/positions/my-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch position info");

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching position info:", error);
      return null;
    }
  }, [token]);

  const hasPermission = useCallback(
    async (permission) => {
      try {
        const positionInfo = await fetchPositionInfo();
        if (!positionInfo) return false;
        return positionInfo.permissions[permission] || false;
      } catch (error) {
        console.error("Error checking permission:", error);
        return false;
      }
    },
    [fetchPositionInfo],
  );

  const canManageUsers = useCallback(
    () => hasPermission("canManageAllUsers"),
    [hasPermission],
  );
  const canManagePositions = useCallback(
    () => hasPermission("canManagePositions"),
    [hasPermission],
  );
  const canViewReports = useCallback(
    () => hasPermission("canViewReports"),
    [hasPermission],
  );
  const canDeleteData = useCallback(
    () => hasPermission("canDeleteData"),
    [hasPermission],
  );
  const canExportData = useCallback(
    () => hasPermission("canExportData"),
    [hasPermission],
  );
  const canImportData = useCallback(
    () => hasPermission("canImportData"),
    [hasPermission],
  );
  const canEditAllComputers = useCallback(
    () => hasPermission("canEditAllComputers"),
    [hasPermission],
  );

  return {
    fetchPositionInfo,
    hasPermission,
    canManageUsers,
    canManagePositions,
    canViewReports,
    canDeleteData,
    canExportData,
    canImportData,
    canEditAllComputers,
  };
}
