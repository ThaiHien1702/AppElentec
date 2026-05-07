import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";

const CATEGORIES = {
  COM: "Cơm", PHO: "Phở", BANHMI: "Bánh mì", CHAO: "Cháo",
  COMCHIEN: "Cơm chiên", MIY: "Mì Ý", SALAD: "Salad", FASTFOOD: "Thức ăn nhanh", KHAC: "Khác",
};
const MEAL_TIMES = { BREAKFAST: "Bữa sáng", LUNCH: "Bữa trưa", DINNER: "Bữa tối" };
const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);
const formatDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "-");
const formatDateTime = (v) => (v ? new Date(v).toLocaleString("vi-VN") : "-");

const cardConfig = [
  { key: "totalToday", label: "Xuất ăn hôm nay", color: "text-slate-800" },
  { key: "pending", label: "Chờ xác nhận", color: "text-amber-700" },
  { key: "confirmed", label: "Đã xác nhận", color: "text-blue-700" },
  { key: "served", label: "Đã phát", color: "text-emerald-700" },
  { key: "cancelled", label: "Đã hủy", color: "text-rose-700" },
];

const MealReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [realtime, setRealtime] = useState(null);
  const [daily, setDaily] = useState([]);
  const [pending, setPending] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportingType, setExportingType] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (fromDate) query.append("from", fromDate);
      if (toDate) query.append("to", toDate);
      const dailyUrl = query.toString()
        ? `${API_PATHS.MEAL_REPORT_DAILY}?${query.toString()}`
        : API_PATHS.MEAL_REPORT_DAILY;

      const [realtimeRes, dailyRes, pendingRes] = await Promise.all([
        axiosInstance.get(API_PATHS.MEAL_REPORT_REALTIME),
        axiosInstance.get(dailyUrl),
        axiosInstance.get(API_PATHS.MEAL_REPORT_PENDING),
      ]);

      setRealtime(realtimeRes.data || null);
      setDaily(Array.isArray(dailyRes.data?.data) ? dailyRes.data.data : []);
      setPending(Array.isArray(pendingRes.data?.data) ? pendingRes.data.data : []);
    } catch (error) {
      handleApiError(error, "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const totalPendingCost = useMemo(() => pending.reduce((s, i) => s + (i.totalPrice || 0), 0), [pending]);

  const exportReport = async () => {
    try {
      setExportingType("excel");
      const response = await axiosInstance.get(
        API_PATHS.MEAL_REPORT_EXPORT(fromDate, toDate),
        { responseType: "blob" },
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meal-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleApiError(error, "Không thể xuất báo cáo");
    } finally {
      setExportingType("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Báo cáo xuất ăn</h1>
            <p className="mt-1 text-sm text-slate-600">Báo cáo realtime, theo ngày và danh sách chờ xác nhận.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto mt-4 md:mt-0">
            <div className="flex-1 min-w-30">
              <label className="mb-1 block text-xs text-slate-500 font-medium">Từ ngày</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="flex-1 min-w-30">
              <label className="mb-1 block text-xs text-slate-500 font-medium">Đến ngày</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={fetchReports} className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 shadow-sm">
                {loading ? "..." : "Làm mới"}
              </button>
              <button onClick={exportReport} disabled={exportingType === "excel"}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-slate-300 shadow-sm">
                Excel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cardConfig.map((card) => (
          <article key={card.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${card.color}`}>{realtime?.summary?.[card.key] ?? 0}</p>
          </article>
        ))}
      </section>

      {/* Recent + Pending */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Hoạt động gần nhất</h2>
            <p className="text-xs text-slate-500">{formatDateTime(realtime?.generatedAt)}</p>
          </div>
          {!realtime?.latestActivities?.length ? (
            <p className="text-sm text-slate-500">Chưa có hoạt động nào.</p>
          ) : (
            <div className="space-y-3">
              {realtime.latestActivities.map((item) => (
                <div key={item._id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-800">{item.employee?.displayName || "N/A"}</p>
                  <p className="text-xs text-slate-600">{item.meal?.name || "N/A"} — {MEAL_TIMES[item.mealTime]}</p>
                  <p className="text-xs text-slate-600">{formatDate(item.distributionDate)} | {item.quantity} suất</p>
                  <p className="mt-1 text-xs text-slate-500">Trạng thái: {item.status} | {formatDateTime(item.updatedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Chờ xác nhận</h2>
            <p className="text-xs text-amber-600">{pending.length} xuất ăn | {formatPrice(totalPendingCost)}</p>
          </div>
          {!pending.length ? (
            <p className="text-sm text-slate-500">Không có xuất ăn chờ xác nhận.</p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {pending.map((item) => (
                <div key={item._id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                  <p className="font-medium text-slate-800">{item.employee?.displayName || "N/A"}</p>
                  <p className="text-xs text-slate-700">Suất ăn: {item.meal?.name || "N/A"}</p>
                  <p className="text-xs text-slate-700">Phòng ban: {item.employee?.department || "N/A"}</p>
                  <p className="mt-1 text-xs text-amber-700">{formatDate(item.distributionDate)} — {MEAL_TIMES[item.mealTime]} ({item.quantity} suất)</p>
                  <p className="text-xs text-slate-600">Tổng: {formatPrice(item.totalPrice)} | Chờ {item.daysPending} ngày</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* Daily table */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Báo cáo theo ngày</h2>
        {!daily.length ? (
          <p className="text-sm text-slate-500">Không có dữ liệu trong khoảng ngày đã chọn.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">Ngày</th>
                  <th className="py-2 pr-3">Tổng</th>
                  <th className="py-2 pr-3">Suất</th>
                  <th className="py-2 pr-3">Chi phí</th>
                  <th className="py-2 pr-3">Chờ XN</th>
                  <th className="py-2 pr-3">Đã XN</th>
                  <th className="py-2 pr-3">Đã phát</th>
                  <th className="py-2 pr-3">Đã hủy</th>
                </tr>
              </thead>
              <tbody>
                {daily.map((row) => (
                  <tr key={row.day} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2 pr-3 font-medium">{row.day}</td>
                    <td className="py-2 pr-3">{row.total}</td>
                    <td className="py-2 pr-3">{row.totalQuantity}</td>
                    <td className="py-2 pr-3 text-emerald-700">{formatPrice(row.totalCost)}</td>
                    <td className="py-2 pr-3">{row.PENDING}</td>
                    <td className="py-2 pr-3">{row.CONFIRMED}</td>
                    <td className="py-2 pr-3">{row.SERVED}</td>
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

export default MealReportPage;
