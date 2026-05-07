const Meal = require("../models/Meal");

class MealController {
  // Lấy danh sách suất ăn
  static async getAll(req, res) {
    try {
      const { category, status, search } = req.query;
      const meals = await Meal.getAll({ category, status, search });

      return res.json({
        success: true,
        data: meals,
        message: "Lấy danh sách suất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách suất ăn",
        error: error.message,
      });
    }
  }

  // Lấy chi tiết suất ăn
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const meal = await Meal.getById(id);

      if (!meal) {
        return res.status(404).json({
          success: false,
          message: "Suất ăn không tồn tại",
        });
      }

      return res.json({
        success: true,
        data: meal,
        message: "Lấy chi tiết suất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy chi tiết suất ăn",
        error: error.message,
      });
    }
  }

  // Tạo suất ăn mới
  static async create(req, res) {
    try {
      // Kiểm tra quyền (chỉ Admin và Canteen Manager)
      if (!["admin", "canteen_manager"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền tạo suất ăn",
        });
      }

      const {
        code,
        name,
        description,
        price,
        category,
        supplier_id,
        status,
        start_time,
        end_time,
      } = req.body;

      // Validate dữ liệu
      if (!code || !name || !price) {
        return res.status(400).json({
          success: false,
          message: "Mã suất ăn, tên và giá tiền là bắt buộc",
        });
      }

      const mealId = await Meal.create({
        code,
        name,
        description,
        price,
        category,
        supplier_id,
        status,
        start_time,
        end_time,
      });

      return res.status(201).json({
        success: true,
        data: { id: mealId },
        message: "Tạo suất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tạo suất ăn",
        error: error.message,
      });
    }
  }

  // Cập nhật suất ăn
  static async update(req, res) {
    try {
      // Kiểm tra quyền (chỉ Admin và Canteen Manager)
      if (!["admin", "canteen_manager"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật suất ăn",
        });
      }

      const { id } = req.params;
      const {
        code,
        name,
        description,
        price,
        category,
        supplier_id,
        status,
        start_time,
        end_time,
      } = req.body;

      // Kiểm tra suất ăn tồn tại
      const meal = await Meal.getById(id);
      if (!meal) {
        return res.status(404).json({
          success: false,
          message: "Suất ăn không tồn tại",
        });
      }

      await Meal.update(id, {
        code,
        name,
        description,
        price,
        category,
        supplier_id,
        status,
        start_time,
        end_time,
      });

      return res.json({
        success: true,
        message: "Cập nhật suất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật suất ăn",
        error: error.message,
      });
    }
  }

  // Xóa suất ăn
  static async delete(req, res) {
    try {
      // Kiểm tra quyền (chỉ Admin)
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xóa suất ăn",
        });
      }

      const { id } = req.params;

      // Kiểm tra suất ăn tồn tại
      const meal = await Meal.getById(id);
      if (!meal) {
        return res.status(404).json({
          success: false,
          message: "Suất ăn không tồn tại",
        });
      }

      await Meal.delete(id);

      return res.json({
        success: true,
        message: "Xóa suất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xóa suất ăn",
        error: error.message,
      });
    }
  }

  // Lấy suất ăn theo danh mục
  static async getByCategory(req, res) {
    try {
      const { category } = req.params;
      const meals = await Meal.getByCategory(category);

      return res.json({
        success: true,
        data: meals,
        message: "Lấy danh sách suất ăn theo danh mục thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy suất ăn theo danh mục",
        error: error.message,
      });
    }
  }

  // Cập nhật trạng thái
  static async updateStatus(req, res) {
    try {
      // Kiểm tra quyền (chỉ Admin và Canteen Manager)
      if (!["admin", "canteen_manager"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật trạng thái",
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!["available", "unavailable"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không hợp lệ",
        });
      }

      await Meal.updateStatus(id, status);

      return res.json({
        success: true,
        message: "Cập nhật trạng thái thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật trạng thái",
        error: error.message,
      });
    }
  }
}

module.exports = MealController;
