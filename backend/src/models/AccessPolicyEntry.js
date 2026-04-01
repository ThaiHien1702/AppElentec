import mongoose from "mongoose";

// Danh sách blacklist/whitelist áp dụng khi tạo hồ sơ và khi verify/check-in tại cổng.
const accessPolicyEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["ID_NUMBER", "PHONE", "VEHICLE_PLATE"],
      required: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    policy: {
      type: String,
      enum: ["BLOCK", "ALLOW"],
      required: true,
      default: "BLOCK",
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

accessPolicyEntrySchema.index({ type: 1, value: 1 }, { unique: true });

const AccessPolicyEntry = mongoose.model(
  "AccessPolicyEntry",
  accessPolicyEntrySchema,
);
export default AccessPolicyEntry;
