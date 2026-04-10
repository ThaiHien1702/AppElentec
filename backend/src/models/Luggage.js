import mongoose from "mongoose";

const luggageSchema = new mongoose.Schema(
  {
    // Liên kết với yêu cầu ra/vào
    visitRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisitRequest",
      required: true,
    },
    // Tên hành lý/vật dụng (ví dụ: "Ba lô", "Công tơ xách tay", "Xe máy")
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    // Mô tả chi tiết (màu sắc, nhãn hiệu, tình trạng, v.v.)
    description: {
      type: String,
      trim: true,
      default: null,
    },
    // Số lượng
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Loại hành lý: PERSONAL_ITEM, LUGGAGE, VEHICLE, EQUIPMENT, OTHER
    itemType: {
      type: String,
      enum: ["PERSONAL_ITEM", "LUGGAGE", "VEHICLE", "EQUIPMENT", "OTHER"],
      default: "PERSONAL_ITEM",
    },
    // Giá trị ước tính (nếu có)
    estimatedValue: {
      type: Number,
      default: null,
      min: 0,
    },
    // Trạng thái: CHECKED_IN (mang vào), CHECKED_OUT (mang ra), LOST (mất), DAMAGED (hư), RETURNED (trả lại)
    status: {
      type: String,
      enum: ["CHECKED_IN", "CHECKED_OUT", "LOST", "DAMAGED", "RETURNED"],
      default: "CHECKED_IN",
    },
    // Người phụ trách ghi nhận check-in
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Thời gian check-in
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
    // Người phụ trách ghi nhận check-out
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Thời gian check-out
    checkedOutAt: {
      type: Date,
      default: null,
    },
    // Hình ảnh hành lý (base64 hoặc URL)
    itemImageData: {
      type: String,
      default: null,
    },
    // Ảnh được chụp lúc check-out để so sánh
    returnImageData: {
      type: String,
      default: null,
    },
    // Ghi chú liên quan đến trạng thái (nếu mất/hư)
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    // Tracking ID (nếu cần)
    trackingCode: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index để tìm nhanh hành lý theo yêu cầu ra/vào
luggageSchema.index({ visitRequest: 1, status: 1 });
luggageSchema.index({ createdAt: -1 });

export default mongoose.model("Luggage", luggageSchema);
