import User from "../models/User.js";
import {
  POSITION_LEVELS,
  VALID_POSITIONS,
  getPositionLevel,
  getPositionDescription,
  getPermissions,
} from "../utils/positionHierarchy.js";

// Get position hierarchy information
export const getPositionHierarchy = async (req, res) => {
  try {
    const hierarchy = VALID_POSITIONS.map((position) => ({
      position,
      level: POSITION_LEVELS[position],
      description: getPositionDescription(position),
      permissions: getPermissions(position),
    }));

    res.status(200).json({
      message: "Lấy thông tin cấp bậc thành công",
      hierarchy,
    });
  } catch (error) {
    console.error("Error getting position hierarchy:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin cấp bậc" });
  }
};

// Get all users with their positions
export const getUsersByPosition = async (req, res) => {
  try {
    const { position } = req.query;

    const query = {};
    if (position && VALID_POSITIONS.includes(position)) {
      query.position = position;
    }

    const users = await User.find(query, {
      idCompanny: 1,
      displayName: 1,
      position: 1,
      department: 1,
      email: 1,
      phone: 1,
      role: 1,
    }).sort({ position: -1, displayName: 1 });

    res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      total: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error getting users by position:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
  }
};

// Update user position (only admin or higher manager can do this)
export const updateUserPosition = async (req, res) => {
  try {
    const { userId } = req.params;
    const { position } = req.body;

    // Validate position
    if (!position || !VALID_POSITIONS.includes(position)) {
      return res.status(400).json({
        message: `Cấp bậc không hợp lệ. Cấp bậc hợp lệ: ${VALID_POSITIONS.join(", ")}`,
      });
    }

    // Check authorization - only admin or manager can change positions
    if (
      req.userRole !== "admin" &&
      getPositionLevel(req.userPosition) < POSITION_LEVELS.Manager
    ) {
      return res.status(403).json({
        message: "Chỉ Manager trở lên mới có quyền thay đổi cấp bậc người dùng",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { position },
      { returnDocument: "after", runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      message: "Cập nhật cấp bậc thành công",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user position:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }
    res.status(500).json({ message: "Lỗi khi cập nhật cấp bậc" });
  }
};

// Get user's position and permissions
export const getUserPositionInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId, {
      position: 1,
      displayName: 1,
      idCompanny: 1,
      department: 1,
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const positionLevel = POSITION_LEVELS[user.position] || 0;
    const permissions = getPermissions(user.position);

    res.status(200).json({
      message: "Lấy thông tin cấp bậc người dùng thành công",
      data: {
        user: {
          _id: user._id,
          idCompanny: user.idCompanny,
          displayName: user.displayName,
          position: user.position,
          department: user.department,
        },
        positionLevel,
        description: getPositionDescription(user.position),
        permissions,
      },
    });
  } catch (error) {
    console.error("Error getting user position info:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin cấp bậc" });
  }
};

// Get users under a specific position (subordinates)
export const getSubordinates = async (req, res) => {
  try {
    const { position } = req.query;

    if (!position || !VALID_POSITIONS.includes(position)) {
      return res.status(400).json({
        message: `Cấp bậc không hợp lệ. Cấp bậc hợp lệ: ${VALID_POSITIONS.join(", ")}`,
      });
    }

    const targetLevel = POSITION_LEVELS[position];

    // Get all users with position level less than target
    const subordinates = await User.find(
      {
        position: {
          $in: VALID_POSITIONS.filter((p) => POSITION_LEVELS[p] < targetLevel),
        },
      },
      {
        idCompanny: 1,
        displayName: 1,
        position: 1,
        department: 1,
        email: 1,
        phone: 1,
      },
    ).sort({ position: -1, displayName: 1 });

    res.status(200).json({
      message: "Lấy danh sách cấp dưới thành công",
      position,
      total: subordinates.length,
      data: subordinates,
    });
  } catch (error) {
    console.error("Error getting subordinates:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách cấp dưới" });
  }
};

// Bulk update user positions (for admin only)
export const bulkUpdatePositions = async (req, res) => {
  try {
    const { updates } = req.body; // Array of {userId, position}

    if (!Array.isArray(updates) || updates.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách cập nhật không hợp lệ" });
    }

    // Check authorization
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Chỉ admin mới có quyền thực hiện thao tác này",
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { userId, position } = update;

        if (!position || !VALID_POSITIONS.includes(position)) {
          errors.push({
            userId,
            error: `Cấp bậc không hợp lệ: ${position}`,
          });
          continue;
        }

        const user = await User.findByIdAndUpdate(
          userId,
          { position },
          { returnDocument: "after", runValidators: true },
        );

        if (user) {
          results.push({
            userId,
            success: true,
            user: {
              displayName: user.displayName,
              position: user.position,
            },
          });
        } else {
          errors.push({
            userId,
            error: "Không tìm thấy người dùng",
          });
        }
      } catch (error) {
        errors.push({
          userId: update.userId,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      message: "Cập nhật cấp bậc hoàn tất",
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error bulk updating positions:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật cấp bậc hàng loạt" });
  }
};

// Get position statistics
export const getPositionStatistics = async (req, res) => {
  try {
    const stats = await Promise.all(
      VALID_POSITIONS.map(async (position) => {
        const users = await User.countDocuments({ position });
        return {
          position,
          count: users,
          level: POSITION_LEVELS[position],
        };
      }),
    );

    const totalUsers = stats.reduce((sum, stat) => sum + stat.count, 0);

    res.status(200).json({
      message: "Lấy thống kê cấp bậc thành công",
      total: totalUsers,
      statistics: stats.sort((a, b) => b.level - a.level),
    });
  } catch (error) {
    console.error("Error getting position statistics:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê cấp bậc" });
  }
};
