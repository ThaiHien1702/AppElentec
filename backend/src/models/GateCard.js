import mongoose from "mongoose";

const gateCardSchema = new mongoose.Schema(
  {
    cardCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "IN_USE", "INACTIVE"],
      default: "AVAILABLE",
      index: true,
    },
    assignedVisit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisitRequest",
    },
    assignedAt: {
      type: Date,
    },
    returnedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const GateCard = mongoose.model("GateCard", gateCardSchema);
export default GateCard;
