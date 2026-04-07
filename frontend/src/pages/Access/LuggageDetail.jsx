import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

const statusColors = {
  CHECKED_IN: "bg-blue-100 text-blue-800",
  CHECKED_OUT: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
  DAMAGED: "bg-yellow-100 text-yellow-800",
  RETURNED: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  CHECKED_IN: "Vừa mang vào",
  CHECKED_OUT: "Đã mang ra",
  LOST: "Mất",
  DAMAGED: "Hư hỏng",
  RETURNED: "Đã trả lại",
};

const LuggageDetail = ({ luggage, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState(luggage?.status || "CHECKED_IN");

  const handleCheckout = async () => {
    if (luggage.status !== "CHECKED_IN") {
      handleApiError(
        null,
        "Chỉ có thể check-out hành lý đang ở trạng thái check-in",
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        notes: notes || undefined,
      };

      await axiosInstance.patch(
        API_PATHS.LUGGAGE_CHECKOUT(luggage._id),
        payload,
      );

      handleApiSuccess("Check-out hành lý thành công");
      onUpdate?.();
      onClose?.();
    } catch (error) {
      handleApiError(error, "Lỗi khi check-out hành lý");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === luggage.status) {
      handleApiError(null, "Vui lòng chọn trạng thái khác");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        status: newStatus,
        notes: notes || undefined,
      };

      await axiosInstance.patch(
        API_PATHS.LUGGAGE_UPDATE_STATUS(luggage._id),
        payload,
      );

      handleApiSuccess(`Cập nhật trạng thái thành: ${statusLabels[newStatus]}`);
      onUpdate?.();
      onClose?.();
    } catch (error) {
      handleApiError(error, "Lỗi khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full max-w-2xl rounded-t-lg overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chi Tiết Hành Lý</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Thông Tin Cơ Bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tracking Code</p>
                <p className="font-mono font-semibold text-blue-600">
                  {luggage?.trackingCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tên Vật Dụng</p>
                <p className="font-semibold">{luggage?.itemName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loại</p>
                <p className="font-semibold">{luggage?.itemType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số Lượng</p>
                <p className="font-semibold">{luggage?.quantity}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Mô Tả</p>
                <p className="text-sm">{luggage?.description || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giá Trị Ước Tính</p>
                <p className="font-semibold">
                  {luggage?.estimatedValue
                    ? `${luggage.estimatedValue.toLocaleString()} ₫`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Ảnh vật dụng */}
          {luggage?.itemImageData && (
            <div>
              <h3 className="font-semibold mb-2">Ảnh Vật Dụng</h3>
              <img
                src={luggage.itemImageData}
                alt="Vật dụng"
                className="w-full max-h-64 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          {/* Thông tin check-in */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Thông Tin Check-In</h3>
            <p className="text-sm">
              <span className="text-gray-600">Ghi nhận bởi:</span>{" "}
              <span className="font-semibold">
                {luggage?.checkedInBy?.displayName || "N/A"}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Thời gian:</span>{" "}
              <span className="font-semibold">
                {new Date(luggage?.checkedInAt).toLocaleString("vi-VN")}
              </span>
            </p>
          </div>

          {/* Thông tin check-out */}
          {luggage?.checkedOutAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Thông Tin Check-Out</h3>
              <p className="text-sm">
                <span className="text-gray-600">Ghi nhận bởi:</span>{" "}
                <span className="font-semibold">
                  {luggage?.checkedOutBy?.displayName || "N/A"}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Thời gian:</span>{" "}
                <span className="font-semibold">
                  {new Date(luggage?.checkedOutAt).toLocaleString("vi-VN")}
                </span>
              </p>
            </div>
          )}

          {/* Ảnh trả lại */}
          {luggage?.returnImageData && (
            <div>
              <h3 className="font-semibold mb-2">Ảnh Lúc Trả Lại</h3>
              <img
                src={luggage.returnImageData}
                alt="Trả lại"
                className="w-full max-h-64 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          {/* Trạng thái hiện tại */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Trạng Thái Hiện Tại</p>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                statusColors[luggage?.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {statusLabels[luggage?.status] || luggage?.status}
            </span>
          </div>

          {/* Ghi chú */}
          {luggage?.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Ghi Chú</p>
              <p className="text-sm">{luggage.notes}</p>
            </div>
          )}

          {/* Actions */}
          {luggage?.status === "CHECKED_IN" && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Thao Tác</h3>

              {/* Check-out */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Check-Out Hành Lý</p>
                <div>
                  <label className="text-sm text-gray-600">
                    Ghi Chú (Tùy Chọn)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Vật dụng còn nguyên vẹn, không tổn hại"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                >
                  {loading ? "Đang xử lý..." : "Check-Out"}
                </button>
              </div>

              {/* Hoặc đánh dấu mất/hư */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">
                  Hoặc Đánh Dấu Trạng Thái Khác
                </p>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  disabled={loading}
                >
                  <option value="CHECKED_IN">Vừa mang vào</option>
                  <option value="LOST">Mất</option>
                  <option value="DAMAGED">Hư hỏng</option>
                  <option value="RETURNED">Đã trả lại</option>
                </select>

                {(newStatus === "LOST" || newStatus === "DAMAGED") && (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mô tả vấn đề..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    disabled={loading}
                  />
                )}

                <button
                  onClick={handleStatusUpdate}
                  disabled={loading || newStatus === luggage?.status}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
                >
                  {loading ? "Đang xử lý..." : "Cập Nhật Trạng Thái"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuggageDetail;
