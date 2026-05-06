import mongoose from "mongoose";

const overtimeSchema = new mongoose.Schema(
  {
    // Người đăng ký OT
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Ngày check-in (ngày làm OT)
    checkInDate: {
      type: Date,
      required: true,
    },
    // OT PLAN - Giờ bắt đầu dự kiến (HH:mm)
    otPlanStart: {
      type: String,
      required: true,
      trim: true,
    },
    // OT PLAN - Giờ kết thúc dự kiến (HH:mm)
    otPlanFinish: {
      type: String,
      required: true,
      trim: true,
    },
    // OT RESULT - Giờ bắt đầu thực tế (HH:mm)
    otResultStart: {
      type: String,
      trim: true,
      default: null,
    },
    // OT RESULT - Giờ kết thúc thực tế (HH:mm)
    otResultFinish: {
      type: String,
      trim: true,
      default: null,
    },
    // Lý do làm thêm
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    // Trạng thái: PENDING (chờ duyệt), APPROVED (đã duyệt), REJECTED (từ chối), CANCELLED (hủy), COMPLETED (đã hoàn thành)
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },
    // Người phê duyệt
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Ngày phê duyệt
    approvedAt: {
      type: Date,
      default: null,
    },
    // Lý do từ chối
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    // Ghi chú bổ sung
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

// Indexes
overtimeSchema.index({ user: 1, status: 1 });
overtimeSchema.index({ checkInDate: -1 });
overtimeSchema.index({ status: 1, createdAt: -1 });
overtimeSchema.index({ approvedBy: 1 });

export default mongoose.model("Overtime", overtimeSchema);
