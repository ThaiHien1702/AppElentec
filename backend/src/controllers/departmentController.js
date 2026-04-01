import Department from "../models/Department.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { setUserDepartmentMembership } from "../utils/departmentMembership.js";

// Lấy tất cả departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return res.status(200).json(departments);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách departments", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy department theo ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    return res.status(200).json(department);
  } catch (error) {
    console.error("Lỗi khi lấy department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Tạo department mới
export const createDepartment = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Tên department không được để trống" });
    }

    // Kiểm tra trùng tên
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: "Department đã tồn tại" });
    }

    const department = await Department.create({
      name,
      description,
      status: status || "active",
    });

    return res.status(201).json({
      message: "Tạo department thành công",
      department,
    });
  } catch (error) {
    console.error("Lỗi khi tạo department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    // Kiểm tra trùng tên với department khác
    if (name) {
      const existing = await Department.findOne({
        name,
        _id: { $ne: id },
      });
      if (existing) {
        return res
          .status(409)
          .json({ message: "Tên department đã được sử dụng" });
      }
    }

    const existingDepartment = await Department.findById(id);
    if (!existingDepartment) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    const oldName = existingDepartment.name;

    if (typeof name === "string") {
      existingDepartment.name = name;
    }
    if (typeof description !== "undefined") {
      existingDepartment.description = description;
    }
    if (typeof status !== "undefined") {
      existingDepartment.status = status;
    }

    await existingDepartment.save();

    if (name && name !== oldName) {
      await User.updateMany({ department: oldName }, { department: name });
    }

    return res.status(200).json({
      message: "Cập nhật department thành công",
      department: existingDepartment,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    await User.updateMany(
      { department: department.name },
      { department: null },
    );

    return res.status(200).json({
      message: "Xóa department thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Toggle status
export const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    department.status = department.status === "active" ? "inactive" : "active";
    await department.save();

    return res.status(200).json({
      message: `Department đã được ${department.status === "active" ? "kích hoạt" : "vô hiệu hóa"}`,
      department,
    });
  } catch (error) {
    console.error("Lỗi khi toggle status", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy users của một department
export const getDepartmentUsers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    const users = await User.find({ department: department.name })
      .select("idCompanny displayName email position")
      .sort({ displayName: 1 });

    // Đồng bộ mảng users trong Department với dữ liệu thực tế từ User.department.
    await Department.updateOne(
      { _id: department._id },
      { users: users.map((member) => member._id) },
    );

    return res.status(200).json({
      message: "Lấy danh sách users thành công",
      users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy users của department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Thêm user vào department
export const addUserToDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ" });
    }

    // Kiểm tra department tồn tại
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    const membershipResult = await setUserDepartmentMembership(
      userId,
      department.name,
    );

    if (!membershipResult.changed) {
      return res
        .status(409)
        .json({ message: "User đã có trong department này" });
    }

    const refreshedDepartment = await Department.findById(id).populate(
      "users",
      "idCompanny displayName email position",
    );

    const message = membershipResult.previousDepartmentName
      ? `Đã chuyển user từ department ${membershipResult.previousDepartmentName} sang ${department.name}`
      : "Thêm user vào department thành công";

    return res.status(200).json({
      message,
      department: refreshedDepartment,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Lỗi khi thêm user vào department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa user khỏi department
export const removeUserFromDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ" });
    }

    // Kiểm tra department tồn tại
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    const user = await User.findById(userId).select("department");
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Kiểm tra user có thuộc department này không
    if ((user.department || "").trim() !== department.name) {
      return res
        .status(404)
        .json({ message: "User không có trong department này" });
    }

    await setUserDepartmentMembership(userId, null);

    const refreshedDepartment = await Department.findById(id).populate(
      "users",
      "idCompanny displayName email position",
    );

    return res.status(200).json({
      message: "Xóa user khỏi department thành công",
      department: refreshedDepartment,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Lỗi khi xóa user khỏi department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
