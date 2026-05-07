const db = require("../libs/db");

class MealInventory {
  // Tạo bảng Inventory
  static createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS meal_inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        meal_id INT NOT NULL,
        quantity_on_hand INT DEFAULT 0,
        quantity_reserved INT DEFAULT 0,
        reorder_level INT DEFAULT 10,
        last_count_date DATE,
        last_updated_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (meal_id) REFERENCES meals(id),
        FOREIGN KEY (last_updated_by) REFERENCES users(id),
        UNIQUE KEY unique_meal (meal_id)
      );
    `;
    return new Promise((resolve, reject) => {
      db.query(query, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Lấy tất cả tồn kho
  static getAll() {
    const query = `
      SELECT mi.*, 
             m.name as meal_name, m.code, m.price,
             u.name as last_updated_by_name
      FROM meal_inventory mi
      LEFT JOIN meals m ON mi.meal_id = m.id
      LEFT JOIN users u ON mi.last_updated_by = u.id
      ORDER BY mi.created_at DESC
    `;
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Lấy chi tiết tồn kho
  static getById(id) {
    const query = `
      SELECT mi.*, 
             m.name as meal_name, m.code, m.price, m.category,
             u.name as last_updated_by_name
      FROM meal_inventory mi
      LEFT JOIN meals m ON mi.meal_id = m.id
      LEFT JOIN users u ON mi.last_updated_by = u.id
      WHERE mi.id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  // Lấy tồn kho của một suất ăn
  static getByMealId(meal_id) {
    const query = `
      SELECT mi.*, 
             m.name as meal_name, m.code, m.price
      FROM meal_inventory mi
      LEFT JOIN meals m ON mi.meal_id = m.id
      WHERE mi.meal_id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [meal_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  // Tạo tồn kho mới
  static create(inventoryData) {
    const { meal_id, quantity_on_hand, reorder_level, last_updated_by } =
      inventoryData;

    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO meal_inventory 
         (meal_id, quantity_on_hand, reorder_level, last_updated_by, last_count_date) 
         VALUES (?, ?, ?, ?, CURDATE())`,
        [meal_id, quantity_on_hand || 0, reorder_level || 10, last_updated_by],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        },
      );
    });
  }

  // Cập nhật tồn kho
  static update(id, inventoryData) {
    const { quantity_on_hand, reorder_level, last_updated_by } = inventoryData;

    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE meal_inventory 
         SET quantity_on_hand = ?, reorder_level = ?, last_updated_by = ?, last_count_date = CURDATE()
         WHERE id = ?`,
        [quantity_on_hand, reorder_level, last_updated_by, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  // Nhập kho (tăng tồn kho)
  static import(id, quantity, last_updated_by) {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE meal_inventory 
         SET quantity_on_hand = quantity_on_hand + ?, last_updated_by = ?, last_count_date = CURDATE()
         WHERE id = ?`,
        [quantity, last_updated_by, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  // Xuất kho (giảm tồn kho)
  static export(id, quantity, last_updated_by) {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE meal_inventory 
         SET quantity_on_hand = GREATEST(0, quantity_on_hand - ?), last_updated_by = ?, last_count_date = CURDATE()
         WHERE id = ?`,
        [quantity, last_updated_by, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  // Lấy danh sách tồn kho thấp
  static getLowStock() {
    const query = `
      SELECT mi.*, 
             m.name as meal_name, m.code, m.price,
             (mi.reorder_level - mi.quantity_on_hand) as shortage
      FROM meal_inventory mi
      LEFT JOIN meals m ON mi.meal_id = m.id
      WHERE mi.quantity_on_hand <= mi.reorder_level
      ORDER BY shortage DESC
    `;
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Xóa tồn kho
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM meal_inventory WHERE id = ?", [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Cập nhật lượng dự trữ
  static updateReserved(meal_id, quantity) {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE meal_inventory 
         SET quantity_reserved = quantity_reserved + ?
         WHERE meal_id = ?`,
        [quantity, meal_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  // Lấy tồn kho có sẵn
  static getAvailableQuantity(meal_id) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT (quantity_on_hand - quantity_reserved) as available
         FROM meal_inventory
         WHERE meal_id = ?`,
        [meal_id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]?.available || 0);
        },
      );
    });
  }
}

module.exports = MealInventory;
