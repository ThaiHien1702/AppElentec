const MealInventory = require("../models/MealInventory");
const Meal = require("../models/Meal");

class MealInventoryController {
  // Lấy danh sách tồn kho
  static async getAll(req, res) {
    try {
      const inventory = await MealInventory.getAll();

      return res.json({
        success: true,
        data: inventory,
        message: "Lấy danh sách tồn kho thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách tồn kho",
        error: error.message,
      });
    }
  }

  // Lấy chi tiết tồn kho
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const inventory = await MealInventory.getById(id);

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Tồn kho không tồn tại",
        });
      }

      return res.json({
        success: true,
        data: inventory,
        message: "Lấy chi tiết tồn kho thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy chi tiết tồn kho",
        error: error.message,
      });
    }
  }

  // Tạo tồn kho mới
  static async create(req, res) {
    try {
      // Kiểm tra quyền (chỉ Canteen Manager và Admin)
      if (!["admin", "canteen_manager"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền tạo tồn kho",
        });
      }

      const { meal_id, quantity_on_hand, reorder_level } = req.body;

      // Validate dữ liệu
      if (!meal_id || quantity_on_hand === undefined) {
        return res.status(400).json({
          success: false,
          message: "Suất ăn và số lượng là bắt buộc",
        });
      }

      // Kiểm tra suất ăn tồn tại
      const meal = await Meal.getById(meal_id);
      if (!meal) {
        return res.status(404).json({
          success: false,
          message: "Suất ăn không tồn tại",
        });
      }

      const inventoryId = await MealInventory.create({
        meal_id,
        quantity_on_hand,
        reorder_level,
        last_updated_by: req.user.id,
      });

      return res.status(201).json({
        success: true,
        data: { id: inventoryId },
        message: "Tạo tồn kho thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tạo tồn kho",
        error: error.message,
      });
    }
  }

  // Cập nhật tồn kho
  static async update(req, res) {
    try {
      // Kiểm tra quyền (chỉ Canteen Manager và Admin)
      if (!["admin", "canteen_manager"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật tồn kho",
        });
      }

      const { id } = req.params;
      const { quantity_on_hand, reorder_level } = req.body;

      // Kiểm tra tồn kho tồn tại
      const inventory = await MealInventory.getById(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Tồn kho không tồn tại",
        });
      }

      await MealInventory.update(id, {
        quantity_on_hand,
        reorder_level,
        last_updated_by: req.user.id,
      });

      return res.json({
        success: true,
        message: "Cập nhật tồn kho thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật tồn kho",
        error: error.message,
      });
    }
  }

  // Nhập kho
  static async import(req, res) {
    try {
      // Kiểm tra quyền (chỉ Canteen Manager và Admin)
      if (!["admin", "canteen_manager"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền nhập kho",
        });
      }

      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Số lượng phải lớn hơn 0",
        });
      }

      // Kiểm tra tồn kho tồn tại
      const inventory = await MealInventory.getById(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Tồn kho không tồn tại",
        });
      }

      await MealInventory.import(id, quantity, req.user.id);

      return res.json({
        success: true,
        message: "Nhập kho thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi nhập kho",
        error: error.message,
      });
    }
  }

  // Xuất kho
  static async export(req, res) {
    try {
      // Kiểm tra quyền (chỉ Canteen Manager và Admin)
      if (!["admin", "canteen_manager"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xuất kho",
        });
      }

      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Số lượng phải lớn hơn 0",
        });
      }

      // Kiểm tra tồn kho tồn tại
      const inventory = await MealInventory.getById(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Tồn kho không tồn tại",
        });
      }

      if (inventory.quantity_on_hand < quantity) {
        return res.status(400).json({
          success: false,
          message: "Số lượng xuất vượt quá tồn kho",
        });
      }

      await MealInventory.export(id, quantity, req.user.id);

      return res.json({
        success: true,
        message: "Xuất kho thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xuất kho",
        error: error.message,
      });
    }
  }

  // Lấy danh sách tồn kho thấp
  static async getLowStock(req, res) {
    try {
      // Kiểm tra quyền
      if (!["admin", "canteen_manager", "accounting"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem cảnh báo tồn kho",
        });
      }

      const lowStock = await MealInventory.getLowStock();

      return res.json({
        success: true,
        data: lowStock,
        message: "Lấy danh sách tồn kho thấp thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách tồn kho thấp",
        error: error.message,
      });
    }
  }

  // Xóa tồn kho
  static async delete(req, res) {
    try {
      // Kiểm tra quyền (chỉ Admin)
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xóa tồn kho",
        });
      }

      const { id } = req.params;

      // Kiểm tra tồn kho tồn tại
      const inventory = await MealInventory.getById(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Tồn kho không tồn tại",
        });
      }

      await MealInventory.delete(id);

      return res.json({
        success: true,
        message: "Xóa tồn kho thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xóa tồn kho",
        error: error.message,
      });
    }
  }

  // Lấy tồn kho có sẵn
  static async getAvailableQuantity(req, res) {
    try {
      const { meal_id } = req.params;
      const available = await MealInventory.getAvailableQuantity(meal_id);

      return res.json({
        success: true,
        data: { meal_id, available_quantity: available },
        message: "Lấy số lượng có sẵn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy số lượng có sẵn",
        error: error.message,
      });
    }
  }
}

module.exports = MealInventoryController;
