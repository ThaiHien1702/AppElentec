import React from "react";
import { Calendar, TrendingUp } from "lucide-react";

const LEAVE_TYPE_LABELS = {
  ANNUAL: "Nghỉ năm",
  SICK: "Nghỉ ốm",
  PERSONAL: "Nghỉ cá nhân",
  MATERNITY: "Nghỉ thai sản",
  OTHER: "Khác",
};

export default function LeaveStats({ stats }) {
  if (!stats || !stats.stats) return null;

  const totalDays = stats.stats.reduce((sum, stat) => sum + stat.totalDays, 0);
  const totalRequests = stats.stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Thống kê nghỉ phép năm {stats.year}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalDays}</div>
          <div className="text-sm text-blue-600">Tổng ngày nghỉ</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {totalRequests}
          </div>
          <div className="text-sm text-green-600">Tổng yêu cầu</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {stats.stats.length}
          </div>
          <div className="text-sm text-purple-600">Loại nghỉ phép</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">
          Chi tiết theo loại nghỉ phép
        </h3>
        {stats.stats.map((stat) => (
          <div
            key={stat._id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {LEAVE_TYPE_LABELS[stat._id] || stat._id}
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold">{stat.totalDays} ngày</div>
              <div className="text-sm text-gray-500">{stat.count} yêu cầu</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
