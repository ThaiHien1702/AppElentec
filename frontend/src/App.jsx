import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ProtectedRouter from "./components/auth/ProtectedRouter";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

// Lazy-load các trang bên trong dashboard để giảm kích thước bundle ban đầu.
// Trang công khai (Landing/Login/SignUp) và guard vẫn nạp ngay cho lần tải đầu.
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage"));
const AdminPanel = lazy(() => import("./pages/Admin/AdminPanel"));
const DepartmentPage = lazy(() => import("./pages/Department/DepartmentPage"));
const ComputerManagement = lazy(() => import("./pages/IT/ComputerManagement"));
const PositionManagement = lazy(
  () => import("./pages/PositionManagement/PositionManagement"),
);
const GateConsole = lazy(() => import("./pages/Access/GateConsole"));
const VisitRequestForm = lazy(() => import("./pages/Access/VisitRequestForm"));
const ApprovalInbox = lazy(() => import("./pages/Access/ApprovalInbox"));
const AccessReportPage = lazy(() => import("./pages/Access/AccessReportPage"));
const LuggageManagement = lazy(
  () => import("./pages/Luggage/LuggageManagement"),
);
const LuggageRegisterPage = lazy(
  () => import("./pages/Luggage/LuggageRegisterPage"),
);
const LuggageReportPage = lazy(
  () => import("./pages/Luggage/LuggageReportPage"),
);
const LeaveManagement = lazy(
  () => import("./pages/LeaveManagement/LeaveManagement"),
);
const LeaveRegisterPage = lazy(
  () => import("./pages/LeaveManagement/LeaveRegisterPage"),
);
const LeaveReportPage = lazy(
  () => import("./pages/LeaveManagement/LeaveReportPage"),
);
const OvertimeManagement = lazy(
  () => import("./pages/OvertimeManagement/OvertimeManagement"),
);
const OvertimeRegisterPage = lazy(
  () => import("./pages/OvertimeManagement/OvertimeRegisterPage"),
);
const OvertimeReportPage = lazy(
  () => import("./pages/OvertimeManagement/OvertimeReportPage"),
);

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg">Loading...</div>
  </div>
);

const App = () => {
  return (
    <div>
      <Router>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Các route công khai */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Các route được bảo vệ - Tất cả người dùng được xác thực */}
          <Route element={<ProtectedRouter />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="departments"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <DepartmentPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="it/computers"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <ComputerManagement />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="access/requests"
              element={
                <RoleProtectedRoute
                  allowedRoles={["user", "moderator", "admin"]}
                >
                  <VisitRequestForm />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="access/gate"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <GateConsole />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="access/approvals"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <ApprovalInbox />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="access/reports"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <AccessReportPage />
                </RoleProtectedRoute>
              }
            />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="leave/register" element={<LeaveRegisterPage />} />
            <Route
              path="leave/reports"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <LeaveReportPage />
                </RoleProtectedRoute>
              }
            />
            <Route path="overtime" element={<OvertimeManagement />} />
            <Route
              path="overtime/register"
              element={<OvertimeRegisterPage />}
            />
            <Route
              path="overtime/reports"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <OvertimeReportPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="luggage"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <LuggageManagement />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="luggage/register"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <LuggageRegisterPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="luggage/reports"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <LuggageReportPage />
                </RoleProtectedRoute>
              }
            />

            {/* Các route Admin - Admin */}
            <Route
              path="admin"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <AdminPanel />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="admin/positions"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <PositionManagement />
                </RoleProtectedRoute>
              }
            />
          </Route>

          {/* Bắt tất cả các route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>
      </Router>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </div>
  );
};

export default App;
