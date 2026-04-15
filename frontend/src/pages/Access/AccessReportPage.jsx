import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";

// Cấu hình các card KPI realtime hiển thị trên đầu trang.
const cardConfig = [
  { key: "totalToday", label: "Tổng yêu cầu hôm nay", color: "text-slate-800" },
  { key: "pendingApproval", label: "Chờ duyệt", color: "text-amber-700" },
  { key: "approved", label: "Đã duyệt", color: "text-emerald-700" },
  { key: "checkedIn", label: "Đang ở trong công ty", color: "text-blue-700" },
  {
    key: "checkedOut",
    label: "Đã check-out hôm nay",
    color: "text-indigo-700",
  },
  { key: "overdue", label: "Quá giờ", color: "text-rose-700" },
];

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
};

const AccessReportPage = () => {
  // State nguồn dữ liệu cho 3 nhóm báo cáo: realtime, daily, overdue.
  const [loading, setLoading] = useState(false);
  const [realtime, setRealtime] = useState(null);
  const [daily, setDaily] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportingType, setExportingType] = useState("");

  // Tải đồng thời 3 API để đồng bộ dữ liệu dashboard trong 1 lần refresh.
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);

      // Truyền bộ lọc ngày cho API daily khi người dùng chọn from/to.
      const query = new URLSearchParams();
      if (fromDate) query.append("from", fromDate);
      if (toDate) query.append("to", toDate);
      const dailyUrl = query.toString()
        ? `${API_PATHS.REPORT_DAILY}?${query.toString()}`
        : API_PATHS.REPORT_DAILY;

      const [realtimeRes, dailyRes, overdueRes] = await Promise.all([
        axiosInstance.get(API_PATHS.REPORT_REALTIME),
        axiosInstance.get(dailyUrl),
        axiosInstance.get(API_PATHS.REPORT_OVERDUE),
      ]);

      setRealtime(realtimeRes.data || null);
      setDaily(Array.isArray(dailyRes.data?.data) ? dailyRes.data.data : []);
      setOverdue(
        Array.isArray(overdueRes.data?.data) ? overdueRes.data.data : [],
      );
    } catch (error) {
      handleApiError(error, "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Tự tải dữ liệu khi vào trang và khi bộ lọc ngày thay đổi.
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Tổng số phút trễ để hiển thị nhanh mức độ backlog quá giờ.
  const totalOverdueMinutes = useMemo(() => {
    return overdue.reduce((sum, item) => sum + (item.overdueMinutes || 0), 0);
  }, [overdue]);

  // Tải file export từ backend, hỗ trợ xlsx hoặc csv.
  const exportReport = async (type) => {
    try {
      setExportingType(type);

      const response = await axiosInstance.get(
        API_PATHS.REPORT_EXPORT(type, fromDate, toDate),
        { responseType: "blob" },
      );

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        type === "csv" ? "access-report.csv" : "access-report.xlsx";
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
      {/* Bộ lọc và hành động refresh dashboard */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Báo cáo truy cập
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Báo cáo realtime, theo ngày và danh sách quá giờ từ dữ liệu thực
              tế.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto mt-4 md:mt-0">
            <div className="flex-1 min-w-[120px]">
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
            <div className="flex-1 min-w-[120px]">
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

      {/* Nhóm KPI realtime */}
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

      {/* Nhật ký gần nhất + danh sách overdue */}
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
                    {item.requestCode} - {item.visitorName}
                  </p>
                  <p className="text-xs text-slate-600">{item.purpose}</p>
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
            <h2 className="text-lg font-semibold text-slate-800">Overdue</h2>
            <p className="text-xs text-rose-600">
              {overdue.length} hồ sơ | Tổng trễ: {totalOverdueMinutes} phút
            </p>
          </div>

          {!overdue.length ? (
            <p className="text-sm text-slate-500">Không có hồ sơ quá giờ.</p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {overdue.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm"
                >
                  <p className="font-medium text-slate-800">
                    {item.requestCode} - {item.visitorName}
                  </p>
                  <p className="text-xs text-slate-700">
                    Khu vực: {item.areaAllowed}
                  </p>
                  <p className="text-xs text-slate-700">
                    Host: {item.hostName}
                  </p>
                  <p className="mt-1 text-xs text-rose-700">
                    Quá giờ: {item.overdueMinutes} phút | Dự kiến ra:{" "}
                    {formatDateTime(item.expectedCheckOutAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* Bảng thống kê theo ngày để theo dõi xu hướng */}
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
                  <th className="py-2 pr-3">Đã từ chối</th>
                  <th className="py-2 pr-3">Check-in</th>
                  <th className="py-2 pr-3">Check-out</th>
                  <th className="py-2 pr-3">Quá giờ</th>
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
                    <td className="py-2 pr-3">{row.PENDING_APPROVAL}</td>
                    <td className="py-2 pr-3">{row.APPROVED}</td>
                    <td className="py-2 pr-3">{row.REJECTED}</td>
                    <td className="py-2 pr-3">{row.CHECKED_IN}</td>
                    <td className="py-2 pr-3">{row.CHECKED_OUT}</td>
                    <td className="py-2 pr-3">{row.OVERDUE}</td>
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

export default AccessReportPage;
