import User from "../models/User.js";
import bcrypt from "bcrypt";
import { setUserDepartmentMembership } from "../utils/departmentMembership.js";

// Lấy thông tin profile của user hiện tại
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Từ verifyToken middleware

    const user = await User.findById(userId).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy profile", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { displayName, email, department, phone, avatrUrl } =
      req.body;

    // Kiểm tra email trùng với user khác
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(409).json({ message: "Email đã được sử dụng" });
      }
    }

    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (email) updateData.email = email;
    // position: user không được tự đổi — chỉ admin mới có quyền thay đổi qua admin controller
    if (phone !== undefined) updateData.phone = phone;
    if (avatrUrl !== undefined) updateData.avatrUrl = avatrUrl;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
    }).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    if (department !== undefined) {
      await setUserDepartmentMembership(userId, department);
    }

    const refreshedUser = await User.findById(userId).select("-hashedPassword");

    return res.status(200).json({
      message: "Cập nhật profile thành công",
      user: refreshedUser,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Lỗi khi cập nhật profile", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Đổi password
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password và new password không được để trống",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password mới phải có ít nhất 6 ký tự",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Kiểm tra current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.hashedPassword,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Password hiện tại không đúng" });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, { hashedPassword });

    return res.status(200).json({ message: "Đổi password thành công" });
  } catch (error) {
    console.error("Lỗi khi đổi password", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
