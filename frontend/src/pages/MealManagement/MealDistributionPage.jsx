import React, { useState } from "react";
import MealDistributionForm from "../../components/MealManagement/MealDistributionForm";
import MealDistributionList from "../../components/MealManagement/MealDistributionList";
import "./MealDistributionPage.css";

const MealDistributionPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("list");
  };

  return (
    <div className="meal-distribution-page">
      <h1>Quản lý xuất ăn</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Danh sách xuất ăn
        </button>
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Tạo xuất ăn mới
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "list" && <MealDistributionList key={refreshKey} />}

        {activeTab === "create" && (
          <MealDistributionForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
};

export default MealDistributionPage;
