import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";
import luggageService from "../../utils/luggageService";

// KPI cards configuration
const cardConfig = [
  { key: "totalToday", label: "Tổng đồ đạc hôm nay", color: "text-slate-800" },
  {
    key: "checkedIn",
    label: "Đã mang vào",
    color: "text-emerald-700",
  },
  {
    key: "checkedOut",
    label: "Đã mang ra",
    color: "text-blue-700",
  },
  { key: "lost", label: "Mất", color: "text-rose-700" },
  { key: "damaged", label: "Hư hỏng", color: "text-orange-700" },
  { key: "returned", label: "Đã trả", color: "text-slate-700" },
];

// Item type mapping
const ITEM_TYPES = {
  PERSONAL_ITEM: "Vật dụng cá nhân",
  LUGGAGE: "Hành lý",
  VEHICLE: "Phương tiện",
  EQUIPMENT: "Thiết bị",
  OTHER: "Khác",
};

// Status mapping
const STATUS_MAP = {
  CHECKED_IN: "Đã mang vào",
  CHECKED_OUT: "Đã mang ra",
  LOST: "Mất",
  DAMAGED: "Hư hỏng",
  RETURNED: "Đã trả",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
};

const LuggageReportPage = () => {
  // State for report data
  const [loading, setLoading] = useState(false);
  const [realtime, setRealtime] = useState(null);
  const [daily, setDaily] = useState([]);
  const [issues, setIssues] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportingType, setExportingType] = useState("");
  const [activeTab, setActiveTab] = useState("realtime"); // realtime, daily, issues

  // Fetch all reports in parallel
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters for daily report
      const query = new URLSearchParams();
      if (fromDate) query.append("from", fromDate);
      if (toDate) query.append("to", toDate);
      const dailyUrl = query.toString()
        ? `${API_PATHS.LUGGAGE_REPORT_DAILY}?${query.toString()}`
        : API_PATHS.LUGGAGE_REPORT_DAILY;

      const [realtimeRes, dailyRes, issuesRes] = await Promise.all([
        axiosInstance.get(API_PATHS.LUGGAGE_REPORT_REALTIME),
        axiosInstance.get(dailyUrl),
        axiosInstance.get(API_PATHS.LUGGAGE_REPORT_ISSUES),
      ]);

      setRealtime(realtimeRes.data || null);
      setDaily(Array.isArray(dailyRes.data?.data) ? dailyRes.data.data : []);
      setIssues(Array.isArray(issuesRes.data?.data) ? issuesRes.data.data : []);
    } catch (error) {
      handleApiError(error, "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Calculate totals
  const totalCheckedIn = useMemo(() => {
    return daily.reduce((sum, item) => sum + (item.CHECKED_IN || 0), 0);
  }, [daily]);

  const totalLost = useMemo(() => {
    return issues.reduce(
      (sum, item) => sum + (item.status === "LOST" ? 1 : 0),
      0,
    );
  }, [issues]);

  const totalDamaged = useMemo(() => {
    return issues.reduce(
      (sum, item) => sum + (item.status === "DAMAGED" ? 1 : 0),
      0,
    );
  }, [issues]);

  // Export report function
  const exportReport = async (type) => {
    try {
      setExportingType(type);

      const response = await luggageService.exportLuggageReport(
        type,
        fromDate,
        toDate,
      );

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        type === "csv" ? "luggage-report.csv" : "luggage-report.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      handleApiError(error, "Không thể xuất báo cáo");
    } finally {
      setExportingType("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter and refresh section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Báo cáo quản lý đồ đạc
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Báo cáo realtime, theo ngày và danh sách vấn đề từ dữ liệu thực
              tế.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto mt-4 md:mt-0">
            <div className="flex-1 min-w-30">
              <label className="mb-1 block text-xs text-slate-500 font-medium tracking-wide">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex-1 min-w-30">
              <label className="mb-1 block text-xs text-slate-500 font-medium tracking-wide">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchReports}
                className="flex-1 sm:flex-none rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                {loading ? "..." : "Làm mới"}
              </button>
              <button
                type="button"
                onClick={() => exportReport("excel")}
                disabled={exportingType === "excel"}
                className="flex-1 sm:flex-none rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-slate-300 shadow-sm transition-colors"
              >
                Excel
              </button>
              <button
                type="button"
                onClick={() => exportReport("csv")}
                disabled={exportingType === "csv"}
                className="flex-1 sm:flex-none rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-slate-300 shadow-sm transition-colors"
              >
                CSV
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cardConfig.map((card) => (
          <article
            key={card.key}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${card.color}`}>
              {realtime?.summary?.[card.key] ?? 0}
            </p>
          </article>
        ))}
      </section>

      {/* Tab Navigation */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("realtime")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "realtime"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Nhật ký gần nhất
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "daily"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Báo cáo theo ngày
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "issues"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Vấn đề phát hiện ({issues.length})
          </button>
        </div>

        <div className="p-5">
          {/* Recent activities */}
          {activeTab === "realtime" && (
            <article>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  Hoạt động gần nhất
                </h2>
                <p className="text-xs text-slate-500">
                  Cập nhật: {formatDateTime(realtime?.generatedAt)}
                </p>
              </div>

              {!realtime?.latestActivities?.length ? (
                <p className="text-sm text-slate-500">Chưa có hoạt động nào.</p>
              ) : (
                <div className="space-y-3">
                  {realtime.latestActivities.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-lg border border-slate-200 p-3 text-sm"
                    >
                      <p className="font-medium text-slate-800">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-slate-600">
                        Loại: {ITEM_TYPES[item.itemType]}
                      </p>
                      <p className="text-xs text-slate-600">
                        Khách: {item.visitRequest?.visitorName || "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-slate-700">
                        Trạng thái:{" "}
                        <span
                          className={`font-medium ${
                            item.status === "CHECKED_OUT"
                              ? "text-blue-600"
                              : item.status === "LOST"
                                ? "text-rose-600"
                                : item.status === "DAMAGED"
                                  ? "text-orange-600"
                                  : "text-emerald-600"
                          }`}
                        >
                          {STATUS_MAP[item.status]}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Cập nhật: {formatDateTime(item.updatedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}

          {/* Daily breakdown table */}
          {activeTab === "daily" && (
            <article>
              <h2 className="mb-3 text-lg font-semibold text-slate-800">
                Báo cáo theo ngày
              </h2>

              {!daily.length ? (
                <p className="text-sm text-slate-500">
                  Không có dữ liệu theo khoảng ngày đã chọn.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                        <th className="py-2 pr-3">Ngày</th>
                        <th className="py-2 pr-3">Tổng</th>
                        <th className="py-2 pr-3">Mang vào</th>
                        <th className="py-2 pr-3">Mang ra</th>
                        <th className="py-2 pr-3">Mất</th>
                        <th className="py-2 pr-3">Hư</th>
                        <th className="py-2 pr-3">Trả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daily.map((row) => (
                        <tr
                          key={row.day}
                          className="border-b border-slate-100 text-slate-700"
                        >
                          <td className="py-2 pr-3 font-medium">
                            {new Date(row.day).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-2 pr-3">{row.total}</td>
                          <td className="py-2 pr-3">{row.CHECKED_IN}</td>
                          <td className="py-2 pr-3">{row.CHECKED_OUT}</td>
                          <td className="py-2 pr-3">{row.LOST}</td>
                          <td className="py-2 pr-3">{row.DAMAGED}</td>
                          <td className="py-2 pr-3">{row.RETURNED}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          )}

          {/* Issues report */}
          {activeTab === "issues" && (
            <article>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  Vấn đề phát hiện
                </h2>
                <p className="text-xs text-rose-600">
                  {issues.length} mục | Mang vào: {totalCheckedIn} | Mất:{" "}
                  {totalLost} | Hư: {totalDamaged}
                </p>
              </div>

              {!issues.length ? (
                <p className="text-sm text-slate-500">
                  Không có vấn đề nào được phát hiện.
                </p>
              ) : (
                <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                  {issues.map((item) => (
                    <div
                      key={item._id}
                      className={`rounded-lg border p-3 text-sm ${
                        item.status === "LOST"
                          ? "border-rose-200 bg-rose-50"
                          : "border-orange-200 bg-orange-50"
                      }`}
                    >
                      <p className="font-medium text-slate-800">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-slate-700">
                        Loại: {ITEM_TYPES[item.itemType]} | Số lượng:{" "}
                        {item.quantity}
                      </p>
                      <p className="text-xs text-slate-700">
                        Khách: {item.visitRequest?.visitorName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-700">
                        Công ty: {item.visitRequest?.visitorCompany || "N/A"}
                      </p>
                      {item.estimatedValue && (
                        <p className="text-xs text-slate-700">
                          Giá trị ước tính:{" "}
                          {item.estimatedValue.toLocaleString("vi-VN")} VND
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-slate-700">
                          Mô tả: {item.description}
                        </p>
                      )}
                      <p
                        className={`mt-1 text-xs font-medium ${
                          item.status === "LOST"
                            ? "text-rose-700"
                            : "text-orange-700"
                        }`}
                      >
                        {item.status === "LOST" ? "MẤT" : "HƯ HỎI"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Ghi nhận bởi: {item.checkedInBy?.displayName || "N/A"} |
                        Phát hiện: {item.daysSinceIssue} ngày trước |{" "}
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}
        </div>
      </section>
    </div>
  );
};

export default LuggageReportPage;
