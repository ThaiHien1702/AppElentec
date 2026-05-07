import React, { useState, useEffect } from "react";
import { mealInventoryService } from "../../utils/mealManagementService";
import "./MealInventory.css";

const MealInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [action, setAction] = useState(null);
  const [quantity, setQuantity] = useState("");

  // Lấy danh sách tồn kho
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await mealInventoryService.getAll();
      if (response.success) {
        setInventory(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải tồn kho");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (id) => {
    setSelectedItem(id);
    setAction("import");
    setQuantity("");
  };

  const handleExport = async (id) => {
    setSelectedItem(id);
    setAction("export");
    setQuantity("");
  };

  const handleConfirmAction = async () => {
    if (!quantity || quantity <= 0) {
      setError("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      let response;
      if (action === "import") {
        response = await mealInventoryService.import(
          selectedItem,
          parseInt(quantity),
        );
      } else {
        response = await mealInventoryService.export(
          selectedItem,
          parseInt(quantity),
        );
      }

      if (response.success) {
        setSuccess(response.message);
        setSelectedItem(null);
        setAction(null);
        setQuantity("");
        fetchInventory();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi thực hiện thao tác");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setAction(null);
    setQuantity("");
  };

  return (
    <div className="meal-inventory-container">
      <h2>Quản lý tồn kho</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : inventory.length === 0 ? (
        <div className="no-data">Không có tồn kho nào</div>
      ) : (
        <>
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Suất ăn</th>
                  <th>Mã suất</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Dự trữ</th>
                  <th>Có sẵn</th>
                  <th>Mức tái đặt hàng</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const available =
                    item.quantity_on_hand - item.quantity_reserved;
                  const isLowStock =
                    item.quantity_on_hand <= item.reorder_level;

                  return (
                    <tr
                      key={item.id}
                      className={isLowStock ? "low-stock-row" : ""}
                    >
                      <td>{item.meal_name}</td>
                      <td>{item.code}</td>
                      <td>{item.price?.toLocaleString()} VNĐ</td>
                      <td>{item.quantity_on_hand}</td>
                      <td>{item.quantity_reserved}</td>
                      <td>{available >= 0 ? available : 0}</td>
                      <td>{item.reorder_level}</td>
                      <td>
                        <span
                          className={`status-badge ${isLowStock ? "low-stock" : "ok"}`}
                        >
                          {isLowStock ? "Tồn kho thấp" : "Bình thường"}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-import"
                          onClick={() => handleImport(item.id)}
                          disabled={loading}
                        >
                          Nhập
                        </button>
                        <button
                          className="btn-export"
                          onClick={() => handleExport(item.id)}
                          disabled={loading || available <= 0}
                        >
                          Xuất
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {action && (
            <div className="action-modal">
              <div className="modal-content">
                <h3>{action === "import" ? "Nhập kho" : "Xuất kho"}</h3>

                <div className="form-group">
                  <label>Số lượng</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    placeholder="Nhập số lượng"
                    disabled={loading}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-primary"
                    onClick={handleConfirmAction}
                    disabled={loading}
                  >
                    {loading ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MealInventory;
