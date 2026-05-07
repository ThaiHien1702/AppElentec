import React, { useState, useEffect } from "react";
import { mealDistributionService } from "../../utils/mealManagementService";
import "./MealDistributionList.css";

const MealDistributionList = ({ filters = {} }) => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [statusFilter, setStatusFilter] = useState("");

  // Lấy danh sách xuất ăn
  useEffect(() => {
    fetchDistributions();
  }, [dateFilter, statusFilter]);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await mealDistributionService.getAll({
        date: dateFilter,
        status: statusFilter,
        ...filters,
      });
      if (response.success) {
        setDistributions(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách xuất ăn");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      const response = await mealDistributionService.confirm(id);
      if (response.success) {
        fetchDistributions();
      }
    } catch (err) {
      setError("Lỗi khi xác nhận xuất ăn");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa xuất ăn này?")) {
      try {
        await mealDistributionService.delete(id);
        fetchDistributions();
      } catch (err) {
        setError("Lỗi khi xóa xuất ăn");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Chờ xác nhận", class: "pending" },
      confirmed: { label: "Đã xác nhận", class: "confirmed" },
      served: { label: "Đã phát", class: "served" },
    };
    return statusMap[status] || { label: status, class: "" };
  };

  return (
    <div className="meal-distribution-list-container">
      <div className="list-filters">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="filter-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="served">Đã phát</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : distributions.length === 0 ? (
        <div className="no-data">Không có xuất ăn nào</div>
      ) : (
        <div className="distributions-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nhân viên</th>
                <th>Phòng ban</th>
                <th>Suất ăn</th>
                <th>Số lượng</th>
                <th>Ngày xuất</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map((dist) => {
                const status = getStatusBadge(dist.status);
                return (
                  <tr key={dist.id}>
                    <td>{dist.id}</td>
                    <td>{dist.employee_name}</td>
                    <td>{dist.department_name}</td>
                    <td>{dist.meal_name}</td>
                    <td>{dist.quantity}</td>
                    <td>
                      {new Date(dist.distribution_date).toLocaleDateString(
                        "vi-VN",
                      )}
                    </td>
                    <td>
                      {(dist.price * dist.quantity)?.toLocaleString()} VNĐ
                    </td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="actions">
                      {dist.status === "pending" && (
                        <button
                          className="btn-confirm"
                          onClick={() => handleConfirm(dist.id)}
                        >
                          Xác nhận
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(dist.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MealDistributionList;
