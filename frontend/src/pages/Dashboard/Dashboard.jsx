import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";
import {
  Calendar,
  Clock,
  DoorOpen,
  Package,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Building2,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

// Status badge style helper
const statusStyle = (status) => {
  switch (status) {
    case "PENDING":
    case "PENDING_APPROVAL":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "APPROVED":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REJECTED":
    case "OVERDUE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "CHECKED_IN":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CHECKED_OUT":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "CANCELLED":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const CARD_TYPES = [
  {
    type: "leave",
    title: "Nghỉ phép",
    icon: Calendar,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    totalColor: "text-violet-700",
    activeRing: "ring-violet-400",
    activeHeader: "bg-violet-600",
    getItems: (s) => [
      { label: "Chờ duyệt", value: s.leave.pending, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
      { label: "Đã duyệt", value: s.leave.approved, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
      { label: "Từ chối", value: s.leave.rejected, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
    ],
    getTotal: (s) => s.leave.total,
    gridCols: "grid-cols-3",
  },
  {
    type: "overtime",
    title: "Làm thêm giờ (OT)",
    icon: Clock,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    totalColor: "text-blue-700",
    activeRing: "ring-blue-400",
    activeHeader: "bg-blue-600",
    getItems: (s) => [
      { label: "Chờ duyệt", value: s.overtime.pending, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
      { label: "Đã duyệt", value: s.overtime.approved, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
      { label: "Hoàn thành", value: s.overtime.completed, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    ],
    getTotal: (s) => s.overtime.total,
    gridCols: "grid-cols-3",
  },
  {
    type: "visits",
    title: "Ra/vào cổng",
    icon: DoorOpen,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    totalColor: "text-emerald-700",
    activeRing: "ring-emerald-400",
    activeHeader: "bg-emerald-600",
    getItems: (s) => [
      { label: "Chờ duyệt", value: s.visits.pendingApproval, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
      { label: "Đã duyệt", value: s.visits.approved, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
      { label: "Đang trong CT", value: s.visits.checkedIn, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
      { label: "Đã check-out", value: s.visits.checkedOut, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
    ],
    getTotal: (s) => s.visits.total,
    gridCols: "grid-cols-2 md:grid-cols-4",
  },
  {
    type: "luggage",
    title: "Đồ đạc ra/vào",
    icon: Package,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    totalColor: "text-amber-700",
    activeRing: "ring-amber-400",
    activeHeader: "bg-amber-600",
    getItems: (s) => [
      { label: "Đang giữ", value: s.luggage.checkedIn, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
      { label: "Đã trả", value: s.luggage.checkedOut, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    ],
    getTotal: (s) => s.luggage.total,
    gridCols: "grid-cols-2",
  },
];

// ─── Detail Table Panel ────────────────────────────────────────────────────
function DetailPanel({ type, department, cardConfig, onClose }) {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const params = department && department !== "all" ? `?department=${department}` : "";
      const res = await axiosInstance.get(`${API_PATHS.DASHBOARD_DETAIL(type)}${params}`);
      setHeaders(res.data.headers || []);
      setRows(res.data.records || []);
    } catch (err) {
      handleApiError(err, "Không thể tải chi tiết");
    } finally {
      setLoading(false);
    }
  }, [type, department]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className={`${cardConfig.activeHeader} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-white">
          <cardConfig.icon className="h-5 w-5" />
          <h2 className="font-semibold text-sm">
            Chi tiết — {cardConfig.title}
          </h2>
          <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {rows.length} bản ghi
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDetail}
            className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30 transition"
          >
            ✕ Đóng
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-500">Đang tải...</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Không có dữ liệu
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">#</th>
                {headers.map((h) => (
                  <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 whitespace-nowrap">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{row.col1}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.col2}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.col3}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.col4}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.col5}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate" title={row.col6}>{row.col6}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle(row.status)}`}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ config, stats, isActive, onClick }) {
  const Icon = config.icon;
  const items = config.getItems(stats);
  const total = config.getTotal(stats);

  return (
    <article
      onClick={onClick}
      className={`cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition-all duration-200
        ${isActive
          ? `border-transparent ring-2 ${config.activeRing} shadow-md`
          : "border-slate-200 hover:shadow-md hover:border-slate-300"
        }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.iconBg}`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <h2 className="text-base font-semibold text-slate-800">{config.title}</h2>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold leading-none ${config.totalColor}`}>{total}</p>
          <p className="mt-1 text-[10px] uppercase font-medium text-slate-400">Tổng</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className={`grid ${config.gridCols} gap-2`}>
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex flex-col items-center justify-center rounded-lg border ${item.border} ${item.bg} py-2.5 px-2 text-center`}
          >
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Click hint */}
      <p className={`mt-3 text-center text-xs transition-opacity ${isActive ? "opacity-100 text-slate-500" : "opacity-0"}`}>
        ▼ Đang xem chi tiết
      </p>
    </article>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const { isAdmin, isModerator } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");
  const [activeType, setActiveType] = useState(null); // which card is clicked
  const canFilter = isAdmin() || isModerator();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const params = canFilter ? `?department=${selectedDept}` : "";
      const res = await axiosInstance.get(`${API_PATHS.DASHBOARD_STATS}${params}`);
      setStats(res.data);
    } catch (error) {
      handleApiError(error, "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  }, [canFilter, selectedDept]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleCardClick = (type) => {
    setActiveType((prev) => (prev === type ? null : type));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  const activeCardConfig = CARD_TYPES.find((c) => c.type === activeType);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 shrink-0">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-slate-800 truncate">
                Thống kê bộ phận — {stats.department || "N/A"}
              </h1>
              <p className="mt-0.5 text-xs md:text-sm text-slate-500">
                Năm {stats.year} • Nhấn vào thẻ để xem chi tiết
              </p>
            </div>
          </div>
          {canFilter && stats.departments?.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setActiveType(null); }}
                className="w-full sm:w-auto rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả bộ phận</option>
                {stats.departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Stat Cards Grid */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {CARD_TYPES.map((config) => (
          <StatCard
            key={config.type}
            config={config}
            stats={stats}
            isActive={activeType === config.type}
            onClick={() => handleCardClick(config.type)}
          />
        ))}
      </section>

      {/* Detail Panel (replaces AccessReportPage when a card is active) */}
      {activeType && activeCardConfig ? (
        <DetailPanel
          type={activeType}
          department={selectedDept}
          cardConfig={activeCardConfig}
          onClose={() => setActiveType(null)}
        />
      ) : null}
    </div>
  );
};

export default Dashboard;
