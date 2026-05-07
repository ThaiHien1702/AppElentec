const MealDistribution = require("../models/MealDistribution");
const Meal = require("../models/Meal");

class MealDistributionController {
  // Lấy danh sách xuất ăn
  static async getAll(req, res) {
    try {
      const { date, employee_id, department_id, status } = req.query;
      const distributions = await MealDistribution.getAll({
        date,
        employee_id,
        department_id,
        status,
      });

      return res.json({
        success: true,
        data: distributions,
        message: "Lấy danh sách xuất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách xuất ăn",
        error: error.message,
      });
    }
  }

  // Lấy chi tiết xuất ăn
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const distribution = await MealDistribution.getById(id);

      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: "Xuất ăn không tồn tại",
        });
      }

      return res.json({
        success: true,
        data: distribution,
        message: "Lấy chi tiết xuất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy chi tiết xuất ăn",
        error: error.message,
      });
    }
  }

  // Tạo xuất ăn mới
  static async create(req, res) {
    try {
      const {
        employee_id,
        meal_id,
        quantity,
        distribution_date,
        distribution_time,
        notes,
      } = req.body;

      // Validate dữ liệu
      if (!employee_id || !meal_id || !distribution_date) {
        return res.status(400).json({
          success: false,
          message: "Nhân viên, suất ăn và ngày xuất ăn là bắt buộc",
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

      const distributionId = await MealDistribution.create({
        employee_id,
        meal_id,
        quantity,
        distribution_date,
        distribution_time,
        notes,
      });

      return res.status(201).json({
        success: true,
        data: { id: distributionId },
        message: "Tạo xuất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tạo xuất ăn",
        error: error.message,
      });
    }
  }

  // Cập nhật xuất ăn
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        employee_id,
        meal_id,
        quantity,
        distribution_date,
        distribution_time,
        status,
        notes,
      } = req.body;

      // Kiểm tra xuất ăn tồn tại
      const distribution = await MealDistribution.getById(id);
      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: "Xuất ăn không tồn tại",
        });
      }

      await MealDistribution.update(id, {
        employee_id,
        meal_id,
        quantity,
        distribution_date,
        distribution_time,
        status,
        notes,
      });

      return res.json({
        success: true,
        message: "Cập nhật xuất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật xuất ăn",
        error: error.message,
      });
    }
  }

  // Xác nhận xuất ăn
  static async confirm(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra xuất ăn tồn tại
      const distribution = await MealDistribution.getById(id);
      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: "Xuất ăn không tồn tại",
        });
      }

      await MealDistribution.confirm(id, req.user.id);

      return res.json({
        success: true,
        message: "Xác nhận xuất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xác nhận xuất ăn",
        error: error.message,
      });
    }
  }

  // Cập nhật trạng thái
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "confirmed", "served"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không hợp lệ",
        });
      }

      await MealDistribution.updateStatus(id, status);

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

  // Xóa xuất ăn
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra xuất ăn tồn tại
      const distribution = await MealDistribution.getById(id);
      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: "Xuất ăn không tồn tại",
        });
      }

      await MealDistribution.delete(id);

      return res.json({
        success: true,
        message: "Xóa xuất ăn thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xóa xuất ăn",
        error: error.message,
      });
    }
  }

  // Lấy xuất ăn của nhân viên theo ngày
  static async getByEmployeeAndDate(req, res) {
    try {
      const { employee_id, date } = req.params;
      const distributions = await MealDistribution.getByEmployeeAndDate(
        employee_id,
        date,
      );

      return res.json({
        success: true,
        data: distributions,
        message: "Lấy xuất ăn của nhân viên theo ngày thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy xuất ăn",
        error: error.message,
      });
    }
  }

  // Lấy tổng xuất ăn theo ngày
  static async getStatsByDate(req, res) {
    try {
      const { date } = req.params;
      const stats = await MealDistribution.getStatsByDate(date);

      // Tính tổng hợp
      const summary = {
        date,
        total_employees: stats.length > 0 ? stats[0].total_employees : 0,
        total_distributions: stats.reduce(
          (sum, s) => sum + s.total_distributions,
          0,
        ),
        total_quantity: stats.reduce(
          (sum, s) => sum + (s.total_quantity || 0),
          0,
        ),
        total_cost: stats.reduce((sum, s) => sum + (s.total_cost || 0), 0),
        meals: stats,
      };

      return res.json({
        success: true,
        data: summary,
        message: "Lấy thống kê xuất ăn theo ngày thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê",
        error: error.message,
      });
    }
  }

  // Lấy tổng xuất ăn theo tháng
  static async getStatsByMonth(req, res) {
    try {
      const { year, month } = req.params;
      const stats = await MealDistribution.getStatsByMonth(year, month);

      // Tính tổng hợp
      const summary = {
        year: parseInt(year),
        month: parseInt(month),
        total_distributions: stats.reduce(
          (sum, s) => sum + s.total_distributions,
          0,
        ),
        total_cost: stats.reduce((sum, s) => sum + (s.total_cost || 0), 0),
        daily_stats: stats,
      };

      return res.json({
        success: true,
        data: summary,
        message: "Lấy thống kê xuất ăn theo tháng thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê tháng",
        error: error.message,
      });
    }
  }

  // Lấy tổng xuất ăn theo phòng ban
  static async getStatsByDepartment(req, res) {
    try {
      const { date } = req.query;
      const stats = await MealDistribution.getStatsByDepartment(date);

      return res.json({
        success: true,
        data: stats,
        message: "Lấy thống kê xuất ăn theo phòng ban thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê phòng ban",
        error: error.message,
      });
    }
  }
}

module.exports = MealDistributionController;
