import React, { useState, useEffect } from "react";
import { mealDistributionService } from "../../utils/mealManagementService";
import "./MealReports.css";

const MealReports = () => {
  const [reportType, setReportType] = useState("daily");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy báo cáo
  useEffect(() => {
    fetchReport();
  }, [reportType, dateFilter, monthFilter, yearFilter]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      let response;

      switch (reportType) {
        case "daily":
          response = await mealDistributionService.getStatsByDate(dateFilter);
          break;
        case "monthly":
          response = await mealDistributionService.getStatsByMonth(
            yearFilter,
            monthFilter,
          );
          break;
        case "department":
          response =
            await mealDistributionService.getStatsByDepartment(dateFilter);
          break;
        default:
          return;
      }

      if (response.success) {
        setReportData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${reportType}-${dateFilter}.json`;
    link.click();
  };

  const renderDailyReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content">
        <h3>
          Báo cáo tổng hợp ngày{" "}
          {new Date(reportData.date).toLocaleDateString("vi-VN")}
        </h3>

        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-label">Tổng nhân viên ăn</div>
            <div className="summary-value">{reportData.total_employees}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Tổng xuất ăn</div>
            <div className="summary-value">
              {reportData.total_distributions}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Tổng số lượng</div>
            <div className="summary-value">{reportData.total_quantity}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Tổng chi phí</div>
            <div className="summary-value">
              {reportData.total_cost?.toLocaleString()} VNĐ
            </div>
          </div>
        </div>

        <table className="report-table">
          <thead>
            <tr>
              <th>Suất ăn</th>
              <th>Số lượng</th>
              <th>Nhân viên ăn</th>
              <th>Tổng chi phí</th>
            </tr>
          </thead>
          <tbody>
            {reportData.meals?.map((meal, idx) => (
              <tr key={idx}>
                <td>{meal.meal_name}</td>
                <td>{meal.meal_count}</td>
                <td>{meal.total_employees}</td>
                <td>{meal.total_cost?.toLocaleString()} VNĐ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content">
        <h3>
          Báo cáo tháng {monthFilter}/{yearFilter}
        </h3>

        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-label">Tổng xuất ăn</div>
            <div className="summary-value">
              {reportData.total_distributions}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Tổng chi phí</div>
            <div className="summary-value">
              {reportData.total_cost?.toLocaleString()} VNĐ
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Chi phí trung bình/ngày</div>
            <div className="summary-value">
              {(
                reportData.total_cost / reportData.daily_stats?.length
              )?.toLocaleString()}{" "}
              VNĐ
            </div>
          </div>
        </div>

        <table className="report-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Nhân viên ăn</th>
              <th>Tổng xuất ăn</th>
              <th>Tổng chi phí</th>
            </tr>
          </thead>
          <tbody>
            {reportData.daily_stats?.map((stat, idx) => (
              <tr key={idx}>
                <td>{new Date(stat.date).toLocaleDateString("vi-VN")}</td>
                <td>{stat.total_employees}</td>
                <td>{stat.total_distributions}</td>
                <td>{stat.total_cost?.toLocaleString()} VNĐ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDepartmentReport = () => {
    if (!reportData || !Array.isArray(reportData)) return null;

    return (
      <div className="report-content">
        <h3>
          Báo cáo xuất ăn theo phòng ban -{" "}
          {new Date(dateFilter).toLocaleDateString("vi-VN")}
        </h3>

        <table className="report-table">
          <thead>
            <tr>
              <th>Phòng ban</th>
              <th>Nhân viên ăn</th>
              <th>Tổng xuất ăn</th>
              <th>Tổng số lượng</th>
              <th>Tổng chi phí</th>
              <th>Chi phí TB/người</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((dept, idx) => (
              <tr key={idx}>
                <td>{dept.department_name}</td>
                <td>{dept.total_employees}</td>
                <td>{dept.total_distributions}</td>
                <td>{dept.total_quantity}</td>
                <td>{dept.total_cost?.toLocaleString()} VNĐ</td>
                <td>
                  {dept.total_employees > 0
                    ? (dept.total_cost / dept.total_employees)?.toLocaleString()
                    : 0}{" "}
                  VNĐ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="meal-reports-container">
      <h2>Báo cáo thống kê xuất ăn</h2>

      <div className="report-filters">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="filter-select"
        >
          <option value="daily">Báo cáo ngày</option>
          <option value="monthly">Báo cáo tháng</option>
          <option value="department">Báo cáo phòng ban</option>
        </select>

        {reportType === "daily" && (
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />
        )}

        {reportType === "monthly" && (
          <>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(parseInt(e.target.value))}
              className="filter-select"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              className="filter-select"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </>
        )}

        {reportType === "department" && (
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />
        )}

        <button
          onClick={handleExport}
          className="btn-export"
          disabled={!reportData}
        >
          Xuất báo cáo
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải báo cáo...</div>
      ) : (
        <>
          {reportType === "daily" && renderDailyReport()}
          {reportType === "monthly" && renderMonthlyReport()}
          {reportType === "department" && renderDepartmentReport()}
        </>
      )}
    </div>
  );
};

export default MealReports;
