import mongoose from "mongoose";

const mealDistributionSchema = new mongoose.Schema(
  {
    // Nhân viên nhận suất ăn
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Phòng ban (lưu trực tiếp để query nhanh, tự động lấy từ employee)
    department: {
      type: String,
      trim: true,
      default: null,
    },
    // Suất ăn được chọn
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
    // Số lượng suất ăn
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    // Ngày xuất ăn
    distributionDate: {
      type: Date,
      required: true,
    },
    // Bữa ăn: BREAKFAST / LUNCH / DINNER
    mealTime: {
      type: String,
      enum: ["BREAKFAST", "LUNCH", "DINNER"],
      default: "LUNCH",
    },
    // Tổng tiền (price * quantity, tính tự động)
    totalPrice: {
      type: Number,
      default: 0,
    },
    // Trạng thái: PENDING (chờ xác nhận), CONFIRMED (đã xác nhận), SERVED (đã phát), CANCELLED (đã hủy)
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SERVED", "CANCELLED"],
      default: "PENDING",
    },
    // Người xác nhận
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Ngày xác nhận
    confirmedAt: {
      type: Date,
      default: null,
    },
    // Người tạo xuất ăn (có thể là moderator tạo hộ)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Ghi chú
    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes để tìm kiếm nhanh
mealDistributionSchema.index({ employee: 1, status: 1 });
mealDistributionSchema.index({ distributionDate: -1 });
mealDistributionSchema.index({ status: 1, createdAt: -1 });
mealDistributionSchema.index({ department: 1, distributionDate: -1 });
mealDistributionSchema.index({ confirmedBy: 1 });
mealDistributionSchema.index({ meal: 1 });

export default mongoose.model("MealDistribution", mealDistributionSchema);
