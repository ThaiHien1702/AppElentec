import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
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
import luggageRoutes from "./routes/luggageRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import overtimeRoutes from "./routes/overtimeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

// Fail fast on missing critical secrets rather than silently falling back to
// insecure defaults (product/license keys are encrypted with ENCRYPTION_KEY).
if (!process.env.ENCRYPTION_KEY) {
  console.error(
    "[Security] ENCRYPTION_KEY is not set in backend/.env. Refusing to start.",
  );
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error(
    "[Security] JWT_SECRET is not set in backend/.env. Refusing to start.",
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";
const USE_HTTPS = process.env.USE_HTTPS === "true";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(helmet());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
      const normalizedOrigin = normalizeOrigin(origin);

      // Allow requests without origin (same-origin, mobile apps, Postman, etc.)
      if (
        !origin ||
        !normalizedOrigin ||
        allowedOrigins.includes(normalizedOrigin)
      ) {
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
app.use("/api/luggage", luggageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/access-control", accessPolicyRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/overtime", overtimeRoutes);
app.use("/api/dashboard", dashboardRoutes);

// primary route

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy tài nguyên" });
});

// Global error handler — last middleware. Catches errors passed via next(err)
// (CORS rejections, multer upload errors, thrown errors) and returns JSON
// instead of Express's default HTML stack trace.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin không được phép (CORS)" });
  }

  if (err?.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File quá lớn (tối đa 5MB)"
        : "Lỗi khi tải file lên";
    return res.status(400).json({ message });
  }

  if (typeof err?.message === "string" && err.message.startsWith("Chỉ chấp nhận file")) {
    return res.status(400).json({ message: err.message });
  }

  console.error("[Error]", err);
  return res.status(err?.status || 500).json({ message: "Lỗi hệ thống" });
});

// connect to database and start server
connectDB().then(() => {
  if (USE_HTTPS) {
    try {
      const keyPath = path.join(__dirname, "../certs/server.key");
      const certPath = path.join(__dirname, "../certs/server.crt");

      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const httpsOptions = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };

        https.createServer(httpsOptions, app).listen(PORT, HOST, () => {
          console.log(`[HTTPS] Server is running on https://${HOST}:${PORT}`);
          console.log(`[LAN] Access it via: https://your-ip-address:${PORT}`);
        });
      } else {
        console.warn("[HTTPS] Certificates not found. Falling back to HTTP.");
        startHttp();
      }
    } catch (error) {
      console.error("[HTTPS] Error starting HTTPS server:", error);
      startHttp();
    }
  } else {
    startHttp();
  }

  function startHttp() {
    app.listen(PORT, HOST, () => {
      console.log(`[HTTP] Server is running on http://${HOST}:${PORT}`);
    });
  }
});
