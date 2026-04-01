import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("[MongoDB] Missing MONGO_URI in backend/.env");
    console.error(
      "[MongoDB] Add MONGO_URI, for example: mongodb://localhost:27017/leaningJWT",
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {});
    console.log("[MongoDB] Connected successfully");
  } catch (error) {
    const message = error?.message || "Unknown error";
    const code = error?.code || "UNKNOWN";
    const lowerMessage = String(message).toLowerCase();

    console.error(`\n[MongoDB] Connection failed (${code}): ${message}`);

    if (code === "ECONNREFUSED" || lowerMessage.includes("econnrefused")) {
      console.error(
        "[MongoDB] Cause: MongoDB is not running or not listening on the configured host/port.",
      );
      console.error("[MongoDB] Fix:");
      console.error("  1) Start MongoDB service (Windows): net start MongoDB");
      console.error("  2) Or run mongod manually if installed without service");
      console.error(
        "  3) Verify backend/.env -> MONGO_URI (e.g. mongodb://localhost:27017/leaningJWT)",
      );
    } else if (code === "ENOTFOUND" || lowerMessage.includes("enotfound")) {
      console.error("[MongoDB] Cause: MongoDB host cannot be resolved.");
      console.error(
        "[MongoDB] Fix: Check hostname in MONGO_URI or your network/DNS settings.",
      );
    } else if (lowerMessage.includes("authentication failed")) {
      console.error("[MongoDB] Cause: Invalid MongoDB username/password.");
      console.error(
        "[MongoDB] Fix: Verify credentials in MONGO_URI (local or MongoDB Atlas).",
      );
    } else if (code === "ETIMEDOUT" || lowerMessage.includes("timed out")) {
      console.error("[MongoDB] Cause: Connection timeout.");
      console.error(
        "[MongoDB] Fix: Check network access, firewall, and Atlas IP allowlist (if using Atlas).",
      );
    } else {
      console.error(
        "[MongoDB] Fix: Check MongoDB server status and MONGO_URI in backend/.env.",
      );
    }

    process.exit(1);
  }
};
