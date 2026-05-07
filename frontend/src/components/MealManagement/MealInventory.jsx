import React, { useState, useEffect } from "react";
import {
  mealInventoryService,
  mealService,
} from "../../utils/mealManagementService";
import { AlertTriangle, Plus, Minus, RefreshCw } from "lucide-react";

const MealInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("import"); // import or export
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await mealInventoryService.getAll();
      if (response.success) {
        setInventory(response.data || []);

        // Get low stock items
        const lowResponse = await mealInventoryService.getLowStock();
        if (lowResponse.success) {
          setLowStockItems(lowResponse.data || []);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải tồn kho");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setQuantity("");
    setShowModal(true);
  };

  const handleSubmitModal = async () => {
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setError("Số lượng phải là số dương");
      return;
    }

    try {
      setModalLoading(true);
      let response;

      if (modalType === "import") {
        response = await mealInventoryService.import(
          selectedItem.id,
          parseInt(quantity),
        );
      } else {
        response = await mealInventoryService.export(
          selectedItem.id,
          parseInt(quantity),
        );
      }

      if (response.success) {
        setShowModal(false);
        fetchInventory();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(
        err.message ||
          `Lỗi khi ${modalType === "import" ? "nhập" : "xuất"} kho`,
      );
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý tồn kho</h2>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-yellow-600" size={20} />
            <h3 className="font-bold text-yellow-800">Cảnh báo tồn kho thấp</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded border border-yellow-200"
              >
                <p className="font-semibold text-gray-700">{item.meal_name}</p>
                <p className="text-sm text-gray-600">
                  Hiện tại: {item.quantity_on_hand} / Tối thiểu:{" "}
                  {item.reorder_level}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Mã
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Suất ăn
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Hiện tại
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Dự trữ
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Tối thiểu
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Cập nhật lúc
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu tồn kho
                </td>
              </tr>
            ) : (
              inventory.map((item) => {
                const isLowStock = item.quantity_on_hand <= item.reorder_level;
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      isLowStock ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 font-semibold">
                      {item.code || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.meal_name}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                      {item.quantity_on_hand}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {item.quantity_reserved}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {item.reorder_level}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {item.last_count_date || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenModal(item, "import")}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors"
                        >
                          <Plus size={14} />
                          Nhập
                        </button>
                        <button
                          onClick={() => handleOpenModal(item, "export")}
                          className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded hover:bg-orange-700 transition-colors"
                        >
                          <Minus size={14} />
                          Xuất
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {modalType === "import" ? "Nhập kho" : "Xuất kho"} -{" "}
              {selectedItem?.meal_name}
            </h3>

            <div className="space-y-4 mb-6">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-600">Tồn kho hiện tại</p>
                <p className="text-2xl font-bold text-blue-700">
                  {selectedItem?.quantity_on_hand}
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700 text-sm">
                  Số lượng {modalType === "import" ? "nhập" : "xuất"}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Nhập số lượng"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {modalType === "export" && quantity && (
                <div className="p-3 bg-orange-50 rounded border border-orange-200">
                  <p className="text-sm text-gray-600">Tồn kho sau</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {Math.max(
                      0,
                      (selectedItem?.quantity_on_hand || 0) -
                        parseInt(quantity),
                    )}
                  </p>
                </div>
              )}

              {modalType === "import" && quantity && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-gray-600">Tồn kho sau</p>
                  <p className="text-2xl font-bold text-green-700">
                    {(selectedItem?.quantity_on_hand || 0) + parseInt(quantity)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md font-semibold hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitModal}
                disabled={modalLoading}
                className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors ${
                  modalType === "import"
                    ? "bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
                    : "bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400"
                } disabled:cursor-not-allowed`}
              >
                {modalLoading
                  ? "Đang xử lý..."
                  : modalType === "import"
                    ? "Nhập kho"
                    : "Xuất kho"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealInventory;
