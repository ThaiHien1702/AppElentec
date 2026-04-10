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
import Dashboard from "./pages/Dashboard/Dashboard";
import ProfilePage from "./pages/Profile/ProfilePage";
import AdminPanel from "./pages/Admin/AdminPanel";
import DepartmentPage from "./pages/Department/DepartmentPage";
import ComputerManagement from "./pages/IT/ComputerManagement";
import PositionManagement from "./pages/PositionManagement/PositionManagement";
import GateConsole from "./pages/Access/GateConsole";
import VisitRequestForm from "./pages/Access/VisitRequestForm";
import ApprovalInbox from "./pages/Access/ApprovalInbox";
import AccessReportPage from "./pages/Access/AccessReportPage";
import LuggageManagement from "./pages/Luggage/LuggageManagement";
import LuggageRegisterPage from "./pages/Luggage/LuggageRegisterPage";
import LeaveManagement from "./pages/LeaveManagement/LeaveManagement";
import LeaveRegisterPage from "./pages/LeaveManagement/LeaveRegisterPage";

const App = () => {
  return (
    <div>
      <Router>
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
