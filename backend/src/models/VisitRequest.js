import mongoose from "mongoose";

// Schema trung tâm cho toàn bộ vòng đời yêu cầu ra/vào cổng.
const visitRequestSchema = new mongoose.Schema(
  {
    // Mã nghiệp vụ để tra cứu nhanh ở frontend và tại cổng.
    requestCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Thông tin định danh khách ra/vào.
    visitorName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectType: {
      type: String,
      enum: ["EMPLOYEE", "GUEST", "CONTRACTOR", "VEHICLE"],
      default: "GUEST",
      index: true,
    },
    visitorPhone: {
      type: String,
      required: true,
      trim: true,
    },
    visitorCompany: {
      type: String,
      trim: true,
    },
    idType: {
      type: String,
      enum: ["CCCD", "Passport", "Other"],
      default: "CCCD",
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
    },
    vehiclePlate: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    hostName: {
      type: String,
      required: true,
      trim: true,
    },
    areaAllowed: {
      type: String,
      required: true,
      trim: true,
    },
    safetyChecklistCompleted: {
      type: Boolean,
      default: false,
    },
    safetyChecklistNote: {
      type: String,
      trim: true,
    },
    expectedCheckInAt: {
      type: Date,
      required: true,
    },
    expectedCheckOutAt: {
      type: Date,
      required: true,
    },
    // Mức ưu tiên phục vụ theo SLA.
    priority: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
    },
    // Trạng thái chính theo state machine SOP.
    status: {
      type: String,
      enum: [
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
        "CHECKED_IN",
        "CHECKED_OUT",
        "OVERDUE",
        "CANCELLED",
      ],
      default: "PENDING_APPROVAL",
    },
    // Thông tin phê duyệt/từ chối.
    rejectionReason: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    // Token phục vụ xác minh tại cổng, có thời hạn.
    qrToken: {
      type: String,
      trim: true,
      index: true,
    },
    qrExpiresAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    // Dấu vết check-in/check-out thực tế.
    checkInAt: {
      type: Date,
    },
    checkOutAt: {
      type: Date,
    },
    // Mã thẻ vật lý có QR cố định được gắn lúc check-in và thu hồi lúc check-out.
    gateCardCode: {
      type: String,
      trim: true,
      index: true,
    },
    gateCardAssignedAt: {
      type: Date,
    },
    gateCardReturnedAt: {
      type: Date,
    },
    // Ảnh chân dung chụp tại lễ tân khi khách check-in.
    portraitImageData: {
      type: String,
    },
    portraitCapturedAt: {
      type: Date,
    },
    // Nhật ký các lần từ chối thủ công để phục vụ kiểm toán.
    deniedLogs: [
      {
        reason: {
          type: String,
          trim: true,
        },
        handledBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deniedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Người tạo yêu cầu.
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const VisitRequest = mongoose.model("VisitRequest", visitRequestSchema);
export default VisitRequest;
