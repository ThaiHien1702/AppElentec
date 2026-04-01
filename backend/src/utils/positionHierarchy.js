/**
 * Position Hierarchy Utilities
 * Defines the organizational structure and position hierarchy
 */

// Position levels with hierarchy (higher number = higher authority)
export const POSITION_LEVELS = {
  Manager: 4,
  "Assistant Manager": 3,
  Supervisor: 2,
  Staff: 1,
};

// All valid positions
export const VALID_POSITIONS = Object.keys(POSITION_LEVELS);

// Get position level value
export const getPositionLevel = (position) => {
  return POSITION_LEVELS[position] || 0;
};

// Check if position1 is higher in hierarchy than position2
export const isHigherPosition = (position1, position2) => {
  return getPositionLevel(position1) > getPositionLevel(position2);
};

// Check if position1 is at least at the same level as position2
export const isAtLeastLevel = (position1, position2) => {
  return getPositionLevel(position1) >= getPositionLevel(position2);
};

// Get all positions that are at or below a certain level
export const getSubordinatePositions = (position) => {
  const level = getPositionLevel(position);
  return VALID_POSITIONS.filter((p) => getPositionLevel(p) <= level);
};

// Get position description
export const getPositionDescription = (position) => {
  const descriptions = {
    Manager: "Quản lý (Cấp cao nhất)",
    "Assistant Manager": "Trợ lý quản lý (Cấp 2)",
    Supervisor: "Giám sát viên (Cấp 3)",
    Staff: "Nhân viên (Cấp thấp nhất)",
  };
  return descriptions[position] || "";
};

// Get position info object
export const getPositionInfo = (position) => {
  return {
    position,
    level: getPositionLevel(position),
    description: getPositionDescription(position),
    validPositions: VALID_POSITIONS,
  };
};

// Permission mapping: what each position can do
export const POSITION_PERMISSIONS = {
  Manager: {
    canManageAllUsers: true,
    canManagePositions: true,
    canViewReports: true,
    canDeleteData: true,
    canExportData: true,
    canImportData: true,
    canEditAllComputers: true,
  },
  "Assistant Manager": {
    canManageAllUsers: false,
    canManagePositions: false,
    canViewReports: true,
    canDeleteData: false,
    canExportData: true,
    canImportData: true,
    canEditAllComputers: true,
  },
  Supervisor: {
    canManageAllUsers: false,
    canManagePositions: false,
    canViewReports: true,
    canDeleteData: false,
    canExportData: true,
    canImportData: false,
    canEditAllComputers: false,
  },
  Staff: {
    canManageAllUsers: false,
    canManagePositions: false,
    canViewReports: false,
    canDeleteData: false,
    canExportData: false,
    canImportData: false,
    canEditAllComputers: false,
  },
};

// Get permissions for a position
export const getPermissions = (position) => {
  return POSITION_PERMISSIONS[position] || POSITION_PERMISSIONS.Staff;
};

// Check if a position has a specific permission
export const hasPermission = (position, permission) => {
  const permissions = getPermissions(position);
  return permissions[permission] || false;
};
