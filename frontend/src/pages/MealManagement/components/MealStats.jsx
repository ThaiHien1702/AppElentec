import React from "react";

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

export default function MealStats({ stats }) {
  if (!stats?.summary) return null;

  const { summary } = stats;

  const cards = [
    { label: "Tổng xuất ăn", value: summary.totalDistributions, color: "text-slate-800" },
    { label: "Tổng suất", value: summary.totalQuantity, color: "text-blue-700" },
    { label: "Tổng chi phí", value: formatPrice(summary.totalCost), color: "text-emerald-700" },
    { label: "Chờ xác nhận", value: summary.pending, color: "text-amber-700" },
    { label: "Đã xác nhận", value: summary.confirmed, color: "text-blue-700" },
    { label: "Đã phát", value: summary.served, color: "text-green-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{card.label}</p>
          <p className={`mt-1 text-lg font-semibold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
