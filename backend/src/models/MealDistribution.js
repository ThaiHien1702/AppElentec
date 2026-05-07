const db = require("../libs/db");

class MealDistribution {
  // Tạo bảng MealDistributions
  static createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS meal_distributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        meal_id INT NOT NULL,
        quantity INT DEFAULT 1,
        distribution_date DATE NOT NULL,
        distribution_time TIME,
        status ENUM('pending', 'confirmed', 'served') DEFAULT 'pending',
        confirmed_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id),
        FOREIGN KEY (meal_id) REFERENCES meals(id),
        FOREIGN KEY (confirmed_by) REFERENCES users(id),
        INDEX idx_employee (employee_id),
        INDEX idx_meal (meal_id),
        INDEX idx_date (distribution_date),
        INDEX idx_status (status)
      );
    `;
    return new Promise((resolve, reject) => {
      db.query(query, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Lấy tất cả xuất ăn
  static getAll(filters = {}) {
    let query = `
      SELECT md.*, 
             u.name as employee_name, u.department_id,
             m.name as meal_name, m.price,
             d.name as department_name
      FROM meal_distributions md
      LEFT JOIN users u ON md.employee_id = u.id
      LEFT JOIN meals m ON md.meal_id = m.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const values = [];

    if (filters.date) {
      query += " AND DATE(md.distribution_date) = ?";
      values.push(filters.date);
    }
    if (filters.employee_id) {
      query += " AND md.employee_id = ?";
      values.push(filters.employee_id);
    }
    if (filters.department_id) {
      query += " AND u.department_id = ?";
      values.push(filters.department_id);
    }
    if (filters.status) {
      query += " AND md.status = ?";
      values.push(filters.status);
    }

    query += " ORDER BY md.distribution_date DESC, md.distribution_time DESC";

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Lấy chi tiết xuất ăn
  static getById(id) {
    const query = `
      SELECT md.*, 
             u.name as employee_name, u.department_id,
             m.name as meal_name, m.price, m.code as meal_code,
             d.name as department_name,
             cb.name as confirmed_by_name
      FROM meal_distributions md
      LEFT JOIN users u ON md.employee_id = u.id
      LEFT JOIN meals m ON md.meal_id = m.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users cb ON md.confirmed_by = cb.id
      WHERE md.id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  // Tạo xuất ăn mới
  static create(distributionData) {
    const {
      employee_id,
      meal_id,
      quantity,
      distribution_date,
      distribution_time,
      notes,
    } = distributionData;

    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO meal_distributions 
         (employee_id, meal_id, quantity, distribution_date, distribution_time, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          employee_id,
          meal_id,
          quantity || 1,
          distribution_date,
          distribution_time || null,
          notes || null,
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        },
      );
    });
  }

  // Cập nhật xuất ăn
  static update(id, distributionData) {
    const {
      employee_id,
      meal_id,
      quantity,
      distribution_date,
      distribution_time,
      status,
      notes,
    } = distributionData;

    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE meal_distributions 
         SET employee_id = ?, meal_id = ?, quantity = ?, distribution_date = ?, distribution_time = ?, status = ?, notes = ?
         WHERE id = ?`,
        [
          employee_id,
          meal_id,
          quantity,
          distribution_date,
          distribution_time,
          status,
          notes,
          id,
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  // Xác nhận xuất ăn
  static confirm(id, confirmed_by) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE meal_distributions SET status = "confirmed", confirmed_by = ? WHERE id = ?',
        [confirmed_by, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  // Cập nhật trạng thái
  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE meal_distributions SET status = ? WHERE id = ?",
        [status, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  // Xóa xuất ăn
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM meal_distributions WHERE id = ?", [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Lấy xuất ăn của nhân viên theo ngày
  static getByEmployeeAndDate(employee_id, date) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT md.*, m.name as meal_name, m.price
         FROM meal_distributions md
         LEFT JOIN meals m ON md.meal_id = m.id
         WHERE md.employee_id = ? AND DATE(md.distribution_date) = ?
         ORDER BY md.distribution_time DESC`,
        [employee_id, date],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        },
      );
    });
  }

  // Lấy tổng xuất ăn theo ngày
  static getStatsByDate(date) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT 
           COUNT(DISTINCT md.employee_id) as total_employees,
           COUNT(md.id) as total_distributions,
           SUM(md.quantity) as total_quantity,
           SUM(m.price * md.quantity) as total_cost,
           m.name as meal_name,
           COUNT(md.id) as meal_count
         FROM meal_distributions md
         LEFT JOIN meals m ON md.meal_id = m.id
         WHERE DATE(md.distribution_date) = ?
         GROUP BY m.name`,
        [date],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        },
      );
    });
  }

  // Lấy tổng xuất ăn theo tháng
  static getStatsByMonth(year, month) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT 
           DATE(md.distribution_date) as date,
           COUNT(DISTINCT md.employee_id) as total_employees,
           COUNT(md.id) as total_distributions,
           SUM(md.quantity) as total_quantity,
           SUM(m.price * md.quantity) as total_cost
         FROM meal_distributions md
         LEFT JOIN meals m ON md.meal_id = m.id
         WHERE YEAR(md.distribution_date) = ? AND MONTH(md.distribution_date) = ?
         GROUP BY DATE(md.distribution_date)
         ORDER BY date DESC`,
        [year, month],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        },
      );
    });
  }

  // Lấy tổng xuất ăn theo phòng ban
  static getStatsByDepartment(date = null) {
    let query = `
      SELECT 
        d.id as department_id,
        d.name as department_name,
        COUNT(DISTINCT md.employee_id) as total_employees,
        COUNT(md.id) as total_distributions,
        SUM(md.quantity) as total_quantity,
        SUM(m.price * md.quantity) as total_cost,
        AVG(m.price * md.quantity) as avg_cost
      FROM meal_distributions md
      LEFT JOIN users u ON md.employee_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN meals m ON md.meal_id = m.id
      WHERE 1=1
    `;
    const values = [];

    if (date) {
      query += " AND DATE(md.distribution_date) = ?";
      values.push(date);
    }

    query += " GROUP BY d.id, d.name ORDER BY total_distributions DESC";

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}

module.exports = MealDistribution;
