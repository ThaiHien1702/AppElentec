import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import computerRoutes from "./routes/computerRoutes.js";
import positionRoutes from "./routes/positionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import approvalRoutes from "./routes/approvalRoutes.js";
import gateRoutes from "./routes/gateRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import accessPolicyRoutes from "./routes/accessPolicyRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "127.0.0.1";

const normalizeOrigin = (value) => value?.trim().replace(/\/$/, "");

const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = normalizeOrigin(origin);

      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Type"],
  }),
);

//public route
app.use("/api/auth", authRoute);
app.use("/api/departments", departmentRoutes);
app.use("/api/computers", computerRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/gate", gateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/access-control", accessPolicyRoutes);

// primary route

// connect to database and start server
connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
});
