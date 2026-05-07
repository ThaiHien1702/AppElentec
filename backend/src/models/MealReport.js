import mongoose from "mongoose";

const mealReportSchema = new mongoose.Schema(
  {
    // Ngày báo cáo
    reportDate: {
      type: Date,
      required: true,
    },
    // Tổng số xuất ăn trong ngày
    totalDistributions: {
      type: Number,
      default: 0,
    },
    // Tổng số suất
    totalQuantity: {
      type: Number,
      default: 0,
    },
    // Tổng chi phí
    totalCost: {
      type: Number,
      default: 0,
    },
    // Theo trạng thái
    byStatus: {
      pending: { type: Number, default: 0 },
      confirmed: { type: Number, default: 0 },
      served: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
    },
    // Theo bữa ăn
    byMealTime: {
      breakfast: { type: Number, default: 0 },
      lunch: { type: Number, default: 0 },
      dinner: { type: Number, default: 0 },
    },
    // Top suất ăn phổ biến
    topMeals: [
      {
        meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
        mealName: String,
        count: Number,
        cost: Number,
      },
    ],
    // Theo phòng ban
    byDepartment: [
      {
        department: String,
        count: Number,
        cost: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

mealReportSchema.index({ reportDate: -1 }, { unique: true });

export default mongoose.model("MealReport", mealReportSchema);
