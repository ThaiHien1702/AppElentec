import React, { useState } from "react";
import MealForm from "../../components/MealManagement/MealForm";
import MealList from "../../components/MealManagement/MealList";
import "./MealManagementPage.css";

const MealManagementPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("list");
  };

  return (
    <div className="meal-management-page">
      <h1>Quản lý suất ăn</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Danh sách suất ăn
        </button>
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Tạo suất ăn mới
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "list" && (
          <MealList key={refreshKey} showActions={true} />
        )}

        {activeTab === "create" && <MealForm onSuccess={handleSuccess} />}
      </div>
    </div>
  );
};

export default MealManagementPage;
