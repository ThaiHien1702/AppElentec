import React, { useState } from "react";
import { mealDistributionService } from "../../utils/mealManagementService";
import { BarChart3, Download } from "lucide-react";

const MealReports = () => {
  const [reportType, setReportType] = useState("daily");
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [departmentDate, setDepartmentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError("");
      let response;

      if (reportType === "daily") {
        response = await mealDistributionService.getStatsByDate(reportDate);
      } else if (reportType === "monthly") {
        response = await mealDistributionService.getStatsByMonth(year, month);
      } else if (reportType === "department") {
        response =
          await mealDistributionService.getStatsByDepartment(departmentDate);
      }

      if (response.success) {
        setReportData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tạo báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Placeholder for PDF export
    alert("Tính năng xuất PDF sẽ được thêm vào");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Báo cáo xuất ăn</h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            value="daily"
            checked={reportType === "daily"}
            onChange={(e) => setReportType(e.target.value)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="font-semibold text-gray-700">Báo cáo ngày</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            value="monthly"
            checked={reportType === "monthly"}
            onChange={(e) => setReportType(e.target.value)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="font-semibold text-gray-700">Báo cáo tháng</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            value="department"
            checked={reportType === "department"}
            onChange={(e) => setReportType(e.target.value)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="font-semibold text-gray-700">Báo cáo phòng ban</span>
        </label>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {reportType === "daily" && (
          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Chọn ngày
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}

        {reportType === "monthly" && (
          <>
            <div>
              <label className="block font-semibold mb-1 text-gray-700 text-sm">
                Tháng
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700 text-sm">
                Năm
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </>
        )}

        {reportType === "department" && (
          <div>
            <label className="block font-semibold mb-1 text-gray-700 text-sm">
              Chọn ngày
            </label>
            <input
              type="date"
              value={departmentDate}
              onChange={(e) => setDepartmentDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <BarChart3 size={18} />
          {loading ? "Đang tạo..." : "Tạo báo cáo"}
        </button>
        {reportData && (
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Xuất PDF
          </button>
        )}
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="mt-8">
          {reportType === "daily" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Nhân viên ăn</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {reportData.total_employees || 0}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Tổng xuất ăn</p>
                  <p className="text-2xl font-bold text-green-700">
                    {reportData.total_distributions || 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Tổng suất</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {reportData.total_quantity || 0}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Tổng chi phí</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {(reportData.total_cost || 0).toLocaleString()} VNĐ
                  </p>
                </div>
              </div>

              {/* Meal Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Suất ăn
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Số lần
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Tổng suất
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.meals?.map((meal, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {meal.meal_name}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold">
                          {meal.meal_count}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold">
                          {meal.total_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === "monthly" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">
                    Tổng xuất ăn tháng
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {reportData.total_distributions || 0}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">
                    Tổng chi phí tháng
                  </p>
                  <p className="text-2xl font-bold text-orange-700">
                    {(reportData.total_cost || 0).toLocaleString()} VNĐ
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Ngày
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Nhân viên
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Xuất ăn
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Chi phí
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.daily_stats?.map((day, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {day.date}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold">
                          {day.total_employees}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold">
                          {day.total_distributions}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold">
                          {(day.total_cost || 0).toLocaleString()} VNĐ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === "department" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Phòng ban
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Nhân viên
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Xuất ăn
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Tổng suất
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Tổng chi phí
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Chi phí TB
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.map((dept, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700 font-semibold">
                        {dept.department_name}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {dept.total_employees}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold">
                        {dept.total_distributions}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {dept.total_quantity}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold">
                        {(dept.total_cost || 0).toLocaleString()} VNĐ
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {(dept.avg_cost || 0).toLocaleString()} VNĐ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealReports;
