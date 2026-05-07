import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    // Mã suất ăn (tự động hoặc nhập)
    code: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true,
    },
    // Tên suất ăn
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Mô tả suất ăn
    description: {
      type: String,
      trim: true,
      default: null,
    },
    // Giá tiền (VND)
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Danh mục suất ăn
    category: {
      type: String,
      enum: ["COM", "PHO", "BANHMI", "CHAO", "COMCHIEN", "MIY", "SALAD", "FASTFOOD", "KHAC"],
      default: "COM",
    },
    // Nhà cung cấp
    supplier: {
      type: String,
      trim: true,
      default: null,
    },
    // Trạng thái: có sẵn / hết hàng
    status: {
      type: String,
      enum: ["AVAILABLE", "UNAVAILABLE"],
      default: "AVAILABLE",
    },
    // Thời gian bắt đầu phục vụ (HH:mm)
    startTime: {
      type: String,
      trim: true,
      default: null,
    },
    // Thời gian kết thúc phục vụ (HH:mm)
    endTime: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
mealSchema.index({ code: 1 });
mealSchema.index({ category: 1, status: 1 });
mealSchema.index({ status: 1 });

export default mongoose.model("Meal", mealSchema);
