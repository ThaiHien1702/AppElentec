import User from "../models/User.js";

// Lấy danh sách tất cả users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-hashedPassword")
      .sort({ displayName: 1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy user theo ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy user", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Tìm kiếm users theo tên hoặc idCompanny
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp query tìm kiếm" });
    }

    const users = await User.find({
      $or: [
        { displayName: { $regex: q, $options: "i" } },
        { idCompanny: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("-hashedPassword")
      .limit(10);

    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm users", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy users theo position
export const getUsersByPosition = async (req, res) => {
  try {
    const { position } = req.query;

    if (!position) {
      return res.status(400).json({ message: "Vui lòng cung cấp position" });
    }

    const users = await User.find({ position })
      .select("-hashedPassword")
      .sort({ displayName: 1 });

    return res.status(200).json({
      message: `Lấy users với position ${position} thành công`,
      data: users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy users theo position", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy users theo department
export const getUsersByDepartment = async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res.status(400).json({ message: "Vui lòng cung cấp department" });
    }

    const users = await User.find({ department })
      .select("-hashedPassword")
      .sort({ displayName: 1 });

    return res.status(200).json({
      message: `Lấy users từ department ${department} thành công`,
      data: users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy users theo department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
