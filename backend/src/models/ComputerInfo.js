import mongoose from "mongoose";

const computerInfoSchema = new mongoose.Schema(
  {
    // ========== PHẦN 1: INFORMATION ==========
    stt: {
      type: Number,
      // Auto-increment handled by pre-save hook
    },
    assetCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      // Format: ELT-LAP-001, ELT-DES-002
    },
    employeeNo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    macAddress: {
      type: String,
      trim: true,
    },
    computerName: {
      type: String,
      required: true,
    },
    userNamePc: {
      type: String,
    },
    categories: {
      type: String,
      enum: ["Desktop", "Laptop", "Workstation", "Server"],
      default: "Laptop",
    },
    manufacturer: {
      type: String,
    },
    serviceTag: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    systemModel: {
      type: String,
    },
    cpu: {
      type: String,
    },
    ram: {
      type: String,
    },
    hdd: {
      type: String,
    },
    ssd: {
      type: String,
    },
    vga: {
      type: String,
    },
    other: {
      type: String,
    },

    // ========== PHẦN 2: OS (OPERATING SYSTEM) ==========
    osVersion: {
      type: String,
      trim: true,
      // Windows 11 Pro, Windows 10, macOS...
    },
    osLicense: {
      type: String,
      trim: true,
      // OEM, Retail, Volume License, Digital License
    },
    osKey: {
      type: String,
      trim: true,
      // Product Key (encrypted)
    },
    osNote: {
      type: String,
    },

    // ========== PHẦN 3: MS OFFICE ==========
    officeVersion: {
      type: String,
      trim: true,
      // Office 365, Office 2021, Office 2019, None
    },
    officeLicense: {
      type: String,
      trim: true,
      // Subscription, OEM, Retail, Volume License
    },
    officeKey: {
      type: String,
      trim: true,
      // Product Key (encrypted)
    },
    officeNote: {
      type: String,
    },

    // ========== PHẦN 4: SOFTWARE (ARRAY) ==========
    installedSoftware: [
      {
        name: {
          type: String,
          required: true,
          enum: [
            "AutoCAD",
            "NX",
            "PowerMill",
            "Mastercam",
            "ZWCAD",
            "Symantec",
          ],
        },
        version: {
          type: String,
          trim: true,
        },
        license: {
          type: String,
          trim: true,
        },
        key: {
          type: String,
          trim: true,
          // Product Key (encrypted)
        },
        note: {
          type: String,
        },
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Inactive", "Under Maintenance", "Retired"],
      default: "Active",
    },
    notes: {
      type: String,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Indexes for efficient querying
computerInfoSchema.index({ department: 1 });
computerInfoSchema.index({ employeeNo: 1 });
computerInfoSchema.index({ computerName: 1 });
computerInfoSchema.index({ email: 1 });
computerInfoSchema.index({ stt: 1 });

// Pre-save hook for auto-increment STT
computerInfoSchema.pre("save", async function () {
  if (this.isNew && !this.stt) {
    const lastComputer = await this.constructor
      .findOne({}, { stt: 1 })
      .sort({ stt: -1 })
      .lean();

    this.stt = lastComputer && lastComputer.stt ? lastComputer.stt + 1 : 1;
  }
});

const ComputerInfo = mongoose.model("ComputerInfo", computerInfoSchema);

export default ComputerInfo;
