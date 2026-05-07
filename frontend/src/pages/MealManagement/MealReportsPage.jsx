import React from "react";
import MealReports from "../../components/MealManagement/MealReports";
import MealInventory from "../../components/MealManagement/MealInventory";
import "./MealReportsPage.css";

const MealReportsPage = () => {
  const [activeTab, setActiveTab] = React.useState("reports");

  return (
    <div className="meal-reports-page">
      <h1>Báo cáo & Thống kê</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Báo cáo thống kê
        </button>
        <button
          className={`tab-button ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          Quản lý tồn kho
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "reports" && <MealReports />}
        {activeTab === "inventory" && <MealInventory />}
      </div>
    </div>
  );
};

export default MealReportsPage;
