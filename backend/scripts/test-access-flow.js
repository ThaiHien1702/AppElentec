import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";
import Session from "../src/models/session.js";
import VisitRequest from "../src/models/VisitRequest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API_BASE_URL =
  process.env.TEST_API_BASE_URL || "http://127.0.0.1:5001/api";

const TEST_USERS = {
  requester: {
    idCompanny: "qa_requester",
    password: "Pass@123",
    displayName: "QA Requester",
    role: "user",
  },
  approver: {
    idCompanny: "qa_approver",
    password: "Pass@123",
    displayName: "QA Approver",
    role: "moderator",
  },
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const request = async (method, path, { token, body, expectedStatus } = {}) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (expectedStatus && response.status !== expectedStatus) {
    throw new Error(
      `API ${method} ${path} expected ${expectedStatus} but got ${response.status}. Response: ${JSON.stringify(data)}`,
    );
  }

  return {
    status: response.status,
    headers: response.headers,
    data,
  };
};

const ensureTestUsers = async () => {
  for (const key of Object.keys(TEST_USERS)) {
    const user = TEST_USERS[key];
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await User.updateOne(
      { idCompanny: user.idCompanny },
      {
        $set: {
          idCompanny: user.idCompanny,
          displayName: user.displayName,
          role: user.role,
          hashedPassword,
          position: "Staff",
          email: `${user.idCompanny}@qa.local`,
        },
      },
      { upsert: true },
    );
  }
};

const signIn = async (idCompanny, password) => {
  const response = await request("POST", "/auth/signin", {
    body: { idCompanny, password },
    expectedStatus: 200,
  });

  assert(
    response.data?.accessToken,
    `Thiếu accessToken khi login ${idCompanny}`,
  );
  return response.data.accessToken;
};

const cleanupTestData = async () => {
  await VisitRequest.deleteMany({
    purpose: { $regex: /^Integration SOP Test/i },
  });

  await Session.deleteMany({
    userId: {
      $in: (
        await User.find({
          idCompanny: {
            $in: Object.values(TEST_USERS).map((u) => u.idCompanny),
          },
        }).select("_id")
      ).map((u) => u._id),
    },
  });
};

const run = async () => {
  const mongoUri = process.env.MONGO_URI;
  assert(mongoUri, "Thiếu MONGO_URI trong backend/.env");

  await mongoose.connect(mongoUri);

  try {
    console.log("[TEST] Bắt đầu integration test Access SOP...");
    console.log(`[TEST] API base: ${API_BASE_URL}`);

    await cleanupTestData();
    await ensureTestUsers();

    const requesterToken = await signIn(
      TEST_USERS.requester.idCompanny,
      TEST_USERS.requester.password,
    );
    const approverToken = await signIn(
      TEST_USERS.approver.idCompanny,
      TEST_USERS.approver.password,
    );

    const now = new Date();
    const checkInAt = new Date(now.getTime() + 30 * 60 * 1000);
    const checkOutAt = new Date(now.getTime() + 90 * 60 * 1000);

    // 1) Requester tạo yêu cầu
    const createRes = await request("POST", "/visits", {
      token: requesterToken,
      expectedStatus: 201,
      body: {
        visitorName: "Khach SOP Integration",
        visitorPhone: "0909000000",
        visitorCompany: "QA Company",
        idType: "CCCD",
        idNumber: "079123123123",
        vehiclePlate: "51A-99999",
        purpose: `Integration SOP Test ${Date.now()}`,
        hostName: "Host QA",
        areaAllowed: "Khoi A Tang 2",
        expectedCheckInAt: checkInAt.toISOString(),
        expectedCheckOutAt: checkOutAt.toISOString(),
        priority: "normal",
      },
    });

    const visit = createRes.data?.visit;
    assert(visit?._id, "Không tạo được visit");
    assert(
      visit.status === "PENDING_APPROVAL",
      "Trạng thái tạo mới không đúng",
    );

    // 2) Approver thấy trong inbox và duyệt
    const inboxRes = await request("GET", "/approvals/inbox", {
      token: approverToken,
      expectedStatus: 200,
    });
    const inInbox = Array.isArray(inboxRes.data)
      ? inboxRes.data.some((item) => item._id === visit._id)
      : false;
    assert(inInbox, "Yêu cầu không xuất hiện trong inbox duyệt");

    const approveRes = await request(
      "POST",
      `/approvals/${visit._id}/approve`,
      {
        token: approverToken,
        expectedStatus: 200,
      },
    );
    assert(
      approveRes.data?.visit?.status === "APPROVED",
      "Duyệt yêu cầu thất bại",
    );

    const requestCode = approveRes.data?.visit?.requestCode;
    assert(requestCode, "Thiếu requestCode sau khi duyệt");

    // 3) Security verify QR
    const verifyRes = await request("POST", "/gate/verify-qr", {
      token: approverToken,
      expectedStatus: 200,
      body: { qrCode: requestCode },
    });
    assert(
      verifyRes.data?.visit?.status === "APPROVED",
      "Verify không trả trạng thái APPROVED",
    );

    // 4) Check-in + idempotent check-in
    const checkInRes = await request("POST", "/gate/check-in", {
      token: approverToken,
      expectedStatus: 200,
      body: { visitId: visit._id },
    });
    assert(
      checkInRes.data?.visit?.status === "CHECKED_IN",
      "Check-in thất bại",
    );

    const checkInAgainRes = await request("POST", "/gate/check-in", {
      token: approverToken,
      expectedStatus: 200,
      body: { visitId: visit._id },
    });
    assert(
      checkInAgainRes.data?.visit?.status === "CHECKED_IN",
      "Idempotent check-in không đúng",
    );

    // 5) Check-out + idempotent check-out
    const checkOutRes = await request("POST", "/gate/check-out", {
      token: approverToken,
      expectedStatus: 200,
      body: { visitId: visit._id },
    });
    assert(
      checkOutRes.data?.visit?.status === "CHECKED_OUT",
      "Check-out thất bại",
    );

    const checkOutAgainRes = await request("POST", "/gate/check-out", {
      token: approverToken,
      expectedStatus: 200,
      body: { visitId: visit._id },
    });
    assert(
      checkOutAgainRes.data?.visit?.status === "CHECKED_OUT",
      "Idempotent check-out không đúng",
    );

    // 6) Kiểm tra report endpoints
    const realtimeRes = await request("GET", "/reports/realtime", {
      token: approverToken,
      expectedStatus: 200,
    });
    assert(realtimeRes.data?.summary, "Realtime report thiếu summary");

    const dailyRes = await request("GET", "/reports/daily", {
      token: approverToken,
      expectedStatus: 200,
    });
    assert(Array.isArray(dailyRes.data?.data), "Daily report thiếu data");

    const overdueRes = await request("GET", "/reports/overdue", {
      token: approverToken,
      expectedStatus: 200,
    });
    assert(Array.isArray(overdueRes.data?.data), "Overdue report thiếu data");

    // 7) Kiểm tra export csv/excel
    const exportCsvRes = await request("GET", "/reports/export?type=csv", {
      token: approverToken,
      expectedStatus: 200,
    });
    const csvType = exportCsvRes.headers.get("content-type") || "";
    assert(csvType.includes("text/csv"), "Export CSV sai content-type");

    const exportExcelRes = await request("GET", "/reports/export?type=excel", {
      token: approverToken,
      expectedStatus: 200,
    });
    const excelType = exportExcelRes.headers.get("content-type") || "";
    assert(
      excelType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ),
      "Export Excel sai content-type",
    );

    console.log("[TEST] PASS: Full flow SOP integration test thành công.");
  } finally {
    await cleanupTestData();
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("[TEST] FAIL:", error.message);
  process.exit(1);
});
