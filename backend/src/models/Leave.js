import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    // Người yêu cầu nghỉ phép
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Loại nghỉ phép: ANNUAL (nghỉ năm), SICK (nghỉ ốm), PERSONAL (nghỉ cá nhân), MATERNITY (nghỉ thai sản), OTHER (khác)
    leaveType: {
      type: String,
      enum: ["ANNUAL", "SICK", "PERSONAL", "MATERNITY", "OTHER"],
      required: true,
    },
    // Ngày bắt đầu nghỉ
    startDate: {
      type: Date,
      required: true,
    },
    // Ngày kết thúc nghỉ
    endDate: {
      type: Date,
      required: true,
    },
    // Số ngày nghỉ (tính tự động)
    daysCount: {
      type: Number,
      required: true,
      min: 0.5, // Cho phép nghỉ nửa ngày
    },
    // Lý do nghỉ phép
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    // Trạng thái: PENDING (chờ duyệt), APPROVED (đã duyệt), REJECTED (từ chối), CANCELLED (hủy)
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    // Người phê duyệt (nếu có)
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
    // Lý do từ chối (nếu có)
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

// Index để tìm nhanh yêu cầu nghỉ phép theo user và trạng thái
leaveSchema.index({ user: 1, status: 1 });
leaveSchema.index({ status: 1, createdAt: -1 });
leaveSchema.index({ approvedBy: 1 });

export default mongoose.model("Leave", leaveSchema);
