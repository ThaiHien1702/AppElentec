import User from "../models/User.js";
import Department from "../models/Department.js";
import bcrypt from "bcrypt";
import { setUserDepartmentMembership } from "../utils/departmentMembership.js";

const ALLOWED_POSITIONS = [
  "Manager",
  "Assistant Manager",
  "Supervisor",
  "Staff",
];

const sortUsersByRolePriority = (usersList) => {
  const rolePriority = {
    admin: 0,
    moderator: 1,
    user: 2,
  };

  return [...usersList].sort((firstUser, secondUser) => {
    const firstPriority = rolePriority[firstUser.role] ?? 99;
    const secondPriority = rolePriority[secondUser.role] ?? 99;

    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority;
    }

    return (firstUser.displayName || "").localeCompare(
      secondUser.displayName || "",
    );
  });
};

// Gán role cho user
export const assignRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res
        .status(400)
        .json({ message: "userId và role không được để trống" });
    }

    const validRoles = ["user", "moderator", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Role phải là một trong: ${validRoles.join(", ")}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { returnDocument: "after" },
    );

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    return res.status(200).json({
      message: `User ${user.displayName} đã được gán role ${role}`,
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gán role", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa role từ user (đặt về user bình thường)
export const removeRole = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: "user" },
      { returnDocument: "after" },
    );

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    return res.status(200).json({
      message: `User ${user.displayName} đã được đặt lại role user`,
      user,
    });
  } catch (error) {
    console.error("Lỗi khi xóa role", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách tất cả users (chỉ admin+)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    return res.status(200).json(sortUsersByRolePriority(users));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách users theo role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const validRoles = ["user", "moderator", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Role phải là một trong: ${validRoles.join(", ")}`,
      });
    }

    const users = await User.find({ role }).select("-hashedPassword");
    return res.status(200).json(sortUsersByRolePriority(users));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users theo role", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy thông tin user bằng ID (chỉ admin+)
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Admin cập nhật profile của user theo ID
export const updateUserProfileByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      idCompanny,
      displayName,
      email,
      department,
      position,
      phone,
      role,
      newPassword,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(409).json({ message: "Email đã được sử dụng" });
      }
    }

    if (idCompanny) {
      const normalizedIdCompanny = idCompanny.trim().toLowerCase();
      const existingIdCompanny = await User.findOne({
        idCompanny: normalizedIdCompanny,
        _id: { $ne: userId },
      });
      if (existingIdCompanny) {
        return res.status(409).json({ message: "ID đã được sử dụng" });
      }
    }

    if (role !== undefined) {
      const validRoles = ["user", "moderator", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: `Role phải là một trong: ${validRoles.join(", ")}`,
        });
      }
    }

    if (
      newPassword !== undefined &&
      newPassword !== "" &&
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    const updateData = {};
    if (idCompanny !== undefined) {
      updateData.idCompanny = idCompanny?.trim().toLowerCase();
    }
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (position !== undefined) {
      if (position !== null && position !== "" && !ALLOWED_POSITIONS.includes(position)) {
        return res.status(400).json({
          message: `Position phải là một trong: ${ALLOWED_POSITIONS.join(", ")}`,
        });
      }
      updateData.position = position;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (newPassword !== undefined && newPassword !== "") {
      updateData.hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    if (department !== undefined) {
      await setUserDepartmentMembership(userId, department);
    }

    const refreshedUser = await User.findById(userId).select("-hashedPassword");

    return res.status(200).json({
      message: "Cập nhật profile user thành công",
      user: refreshedUser,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Lỗi khi admin cập nhật profile user", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa user (chỉ admin)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    // Không cho xóa admin
    const user = await User.findById(userId);
    if (user?.role === "admin") {
      return res.status(403).json({ message: "Không thể xóa admin" });
    }

    await Department.updateMany({}, { $pull: { users: userId } });
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "User đã được xóa thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa user", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
