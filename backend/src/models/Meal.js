const db = require("../libs/db");

class Meal {
  // Tạo bảng Meals
  static createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS meals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        supplier_id INT,
        status ENUM('available', 'unavailable') DEFAULT 'available',
        start_time TIME,
        end_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_code (code)
      );
    `;
    return new Promise((resolve, reject) => {
      db.query(query, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Lấy tất cả suất ăn
  static getAll(filters = {}) {
    let query = "SELECT * FROM meals WHERE 1=1";
    const values = [];

    if (filters.category) {
      query += " AND category = ?";
      values.push(filters.category);
    }
    if (filters.status) {
      query += " AND status = ?";
      values.push(filters.status);
    }
    if (filters.search) {
      query += " AND (name LIKE ? OR code LIKE ?)";
      values.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += " ORDER BY created_at DESC";

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Lấy chi tiết suất ăn
  static getById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM meals WHERE id = ?", [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  // Tạo suất ăn mới
  static create(mealData) {
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
    } = mealData;

    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO meals (code, name, description, price, category, supplier_id, status, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          code,
          name,
          description,
          price,
          category,
          supplier_id,
          status || "available",
          start_time,
          end_time,
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        },
      );
    });
  }

  // Cập nhật suất ăn
  static update(id, mealData) {
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
    } = mealData;

    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE meals SET code = ?, name = ?, description = ?, price = ?, category = ?, supplier_id = ?, status = ?, start_time = ?, end_time = ? WHERE id = ?",
        [
          code,
          name,
          description,
          price,
          category,
          supplier_id,
          status,
          start_time,
          end_time,
          id,
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  // Xóa suất ăn
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM meals WHERE id = ?", [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Lấy suất ăn theo danh mục
  static getByCategory(category) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM meals WHERE category = ? AND status = "available"',
        [category],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        },
      );
    });
  }

  // Cập nhật trạng thái
  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE meals SET status = ? WHERE id = ?",
        [status, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }
}

module.exports = Meal;
