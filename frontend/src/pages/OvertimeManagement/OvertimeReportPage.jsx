import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";

// KPI cards configuration
const cardConfig = [
  { key: "totalToday", label: "Tổng yêu cầu hôm nay", color: "text-slate-800" },
  { key: "pendingApproval", label: "Chờ duyệt", color: "text-amber-700" },
  { key: "approved", label: "Đã duyệt", color: "text-emerald-700" },
  { key: "completed", label: "Hoàn thành", color: "text-blue-700" },
  { key: "rejected", label: "Từ chối", color: "text-rose-700" },
  { key: "cancelled", label: "Đã hủy", color: "text-slate-700" },
];

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
};

const formatTime = (value) => {
  if (!value) return "-";
  return value;
};

const OvertimeReportPage = () => {
  // State for report data
  const [loading, setLoading] = useState(false);
  const [realtime, setRealtime] = useState(null);
  const [daily, setDaily] = useState([]);
  const [pending, setPending] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportingType, setExportingType] = useState("");

  // Fetch all reports in parallel
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters for daily report
      const query = new URLSearchParams();
      if (fromDate) query.append("from", fromDate);
      if (toDate) query.append("to", toDate);
      const dailyUrl = query.toString()
        ? `${API_PATHS.OVERTIME_REPORT_DAILY}?${query.toString()}`
        : API_PATHS.OVERTIME_REPORT_DAILY;

      const [realtimeRes, dailyRes, pendingRes] = await Promise.all([
        axiosInstance.get(API_PATHS.OVERTIME_REPORT_REALTIME),
        axiosInstance.get(dailyUrl),
        axiosInstance.get(API_PATHS.OVERTIME_REPORT_PENDING),
      ]);

      setRealtime(realtimeRes.data || null);
      setDaily(Array.isArray(dailyRes.data?.data) ? dailyRes.data.data : []);
      setPending(
        Array.isArray(pendingRes.data?.data) ? pendingRes.data.data : [],
      );
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

  // Calculate total pending hours
  const totalPendingHours = useMemo(() => {
    return pending.length;
  }, [pending]);

  // Export report function
  const exportReport = async (type) => {
    try {
      setExportingType(type);

      const response = await axiosInstance.get(
        API_PATHS.OVERTIME_REPORT_EXPORT(type, fromDate, toDate),
        { responseType: "blob" },
      );

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        type === "csv" ? "overtime-report.csv" : "overtime-report.xlsx";
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
              Báo cáo giờ làm thêm
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Báo cáo realtime, theo ngày và danh sách chờ duyệt từ dữ liệu thực
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

      {/* Recent activities + Pending requests */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Nhật ký gần nhất
            </h2>
            <p className="text-xs text-slate-500">
              Generated: {formatDateTime(realtime?.generatedAt)}
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
                    {item.user?.displayName || "N/A"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {formatDate(item.checkInDate)} (
                    {formatTime(item.checkInTime)} -{" "}
                    {formatTime(item.checkOutTime)})
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Trạng thái: {item.status} | Cập nhật:{" "}
                    {formatDateTime(item.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Chờ duyệt</h2>
            <p className="text-xs text-amber-600">{pending.length} yêu cầu</p>
          </div>

          {!pending.length ? (
            <p className="text-sm text-slate-500">
              Không có yêu cầu chờ duyệt.
            </p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {pending.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
                >
                  <p className="font-medium text-slate-800">
                    {item.user?.displayName || "N/A"}
                  </p>
                  <p className="text-xs text-slate-700">
                    Phòng ban: {item.user?.department || "N/A"}
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    {formatDate(item.checkInDate)} (
                    {formatTime(item.checkInTime)} -{" "}
                    {formatTime(item.checkOutTime)})
                  </p>
                  <p className="text-xs text-slate-600">
                    Lý do: {item.reason || "Không có"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Chờ duyệt: {item.daysPending} ngày | Yêu cầu lúc:{" "}
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* Daily breakdown table */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
                  <th className="py-2 pr-3">Chờ duyệt</th>
                  <th className="py-2 pr-3">Đã duyệt</th>
                  <th className="py-2 pr-3">Hoàn thành</th>
                  <th className="py-2 pr-3">Từ chối</th>
                  <th className="py-2 pr-3">Đã hủy</th>
                </tr>
              </thead>
              <tbody>
                {daily.map((row) => (
                  <tr
                    key={row.day}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="py-2 pr-3 font-medium">{row.day}</td>
                    <td className="py-2 pr-3">{row.total}</td>
                    <td className="py-2 pr-3">{row.PENDING}</td>
                    <td className="py-2 pr-3">{row.APPROVED}</td>
                    <td className="py-2 pr-3">{row.COMPLETED}</td>
                    <td className="py-2 pr-3">{row.REJECTED}</td>
                    <td className="py-2 pr-3">{row.CANCELLED}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default OvertimeReportPage;
