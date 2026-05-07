import React, { useState } from "react";
import MealDistributionForm from "../../components/MealManagement/MealDistributionForm";
import MealDistributionList from "../../components/MealManagement/MealDistributionList";
import MealReports from "../../components/MealManagement/MealReports";
import MealInventory from "../../components/MealManagement/MealInventory";

const MealManagementPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Quản lý xuất ăn
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-0 border-b-2 border-gray-300 mb-6 flex-wrap bg-white rounded-t-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === "create"
                ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Tạo xuất ăn
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === "list"
                ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Danh sách xuất ăn
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === "reports"
                ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Báo cáo
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === "inventory"
                ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Tồn kho
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === "create" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <MealDistributionForm onSuccess={handleRefresh} />
            </div>
          )}

          {activeTab === "list" && (
            <div className="bg-white rounded-lg shadow-md">
              <MealDistributionList
                key={refreshTrigger}
                onRefresh={handleRefresh}
              />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-white rounded-lg shadow-md">
              <MealReports key={refreshTrigger} />
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="bg-white rounded-lg shadow-md">
              <MealInventory key={refreshTrigger} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MealManagementPage;
