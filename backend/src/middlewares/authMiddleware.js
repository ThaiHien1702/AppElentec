import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Position hierarchy levels (higher number = higher authority)
const POSITION_LEVELS = {
  Manager: 4,
  "Assistant Manager": 3,
  Supervisor: 2,
  Staff: 1,
};

// Middleware kiểm tra user đã login
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // Fetch position from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Người dùng không còn tồn tại" });
    }

    req.userPosition = user.position;
    req.userDepartment = user.department;
    req.positionLevel = POSITION_LEVELS[user.position] || 0;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Middleware chỉ cho phép moderator trở lên
export const isModerator = (req, res, next) => {
  const allowedRoles = ["moderator", "admin"];
  if (!allowedRoles.includes(req.userRole)) {
    return res
      .status(403)
      .json({ message: "Chỉ moderator trở lên mới có quyền truy cập" });
  }
  next();
};

// Middleware chỉ cho phép admin
export const isAdmin = (req, res, next) => {
  const allowedRoles = ["admin"];
  if (!allowedRoles.includes(req.userRole)) {
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }
  next();
};

// Middleware kiểm tra quyền Manager route: admin luôn được phép,
// các role còn lại phải có cấp bậc Manager trở lên.
export const isManager = (req, res, next) => {
  if (req.userRole === "admin") {
    return next();
  }

  if (req.positionLevel < POSITION_LEVELS.Manager) {
    return res.status(403).json({
      message: "Chỉ Manager trở lên mới có quyền truy cập",
    });
  }
  next();
};

// Middleware kiểm tra position Assistant Manager trở lên
export const isAssistantManagerOrAbove = (req, res, next) => {
  if (req.userRole === "admin") {
    return next();
  }

  if (req.positionLevel < POSITION_LEVELS["Assistant Manager"]) {
    return res.status(403).json({
      message: "Chỉ Assistant Manager trở lên mới có quyền truy cập",
    });
  }
  next();
};

// Middleware kiểm tra position Supervisor trở lên
export const isSupervisor = (req, res, next) => {
  if (req.userRole === "admin") {
    return next();
  }

  if (req.positionLevel < POSITION_LEVELS.Supervisor) {
    return res.status(403).json({
      message: "Chỉ Supervisor trở lên mới có quyền truy cập",
    });
  }
  next();
};

// Middleware kiểm tra position cụ thể
export const checkPosition = (allowedPositions) => {
  return (req, res, next) => {
    if (!allowedPositions.includes(req.userPosition)) {
      return res.status(403).json({
        message: `Chỉ ${allowedPositions.join(", ")} mới có quyền truy cập`,
      });
    }
    next();
  };
};

// Middleware kiểm tra position >= minLevel
export const checkPositionLevel = (minLevel) => {
  return (req, res, next) => {
    if (req.positionLevel < minLevel) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập tài nguyên này",
      });
    }
    next();
  };
};
