import './App.css'
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import LoginPageAdmin from "./pages/Login/AdminLogin/AdminLogin";

import DepartmentsTable from "./pages/Admin/Dashboard/Department/DepartmentsTable";
import PositionsTable from "./pages/Admin/Dashboard/Positions/PositionTable";
import UsersTable from "./pages/Admin/Dashboard/Users/Users";
import CreateAdminForm from "./pages/Admin/Dashboard/Users/Create/CreateAdmin";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import AdminLayout from "./pages/Admin/Dashboard/AdminLayout";

import AppLayout from "./pages/Manager/Layout/Layout";
import WorkerDashboard from "./pages/Worker/Dashboard/WorkerDashboard";

import AdminGate from "./pages/Admin/AdminGate/AdminGate";
import AdminGateRoute from "./pages/Admin/AdminGate/AdminRoute";

import RequireAuth from "./routes/RequireAuth";
import RequireRole from "./routes/RequireRole";
import AttendanceDashboard from './pages/Manager/Dashboard/Attendance/Attendance';
import ManagerDashboard from './pages/Manager/Dashboard/ManagerDashboard';
import Contracts from './pages/Manager/Dashboard/Contracts/Contracts';
import EmployeesTable from './pages/Manager/Dashboard/Workers/Workers';
import CreateWorkersForm from './pages/Manager/Dashboard/CreateWorker';
import EmployeeProfilePage from './pages/Admin/Dashboard/Users/Profile/Profile';
import EmployeeProfile from './pages/Manager/Dashboard/Workers/Profile/EmployeeProfile';
import MyProfile from "./pages/Profile/Profile";
import ContractsTable from './pages/Admin/Dashboard/Contracts/Contracts';
import ManagersTable from './pages/Admin/Dashboard/Managers/Manager';

const App = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/admin" element={<AdminGate />} />
      <Route
        path="/admin/login"
        element={
          <AdminGateRoute>
            <LoginPageAdmin />
          </AdminGateRoute>
        }
      />

      {/* ================= ADMIN ================= */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RequireRole role="admin">
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Dashboard />} />
        <Route path="users" element={<UsersTable />} />
        <Route path="managers" element={<ManagersTable />} />
        <Route path="users/create" element={<CreateAdminForm />} />
        <Route path="users/profile/:id" element={<EmployeeProfilePage />} />
        <Route path="departments" element={<DepartmentsTable />} />
        <Route path="positions" element={<PositionsTable />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="contracts" element={<ContractsTable />} />
      </Route>

      {/* ================= MANAGER ================= */}
      <Route
        path="/manager"
        element={
          <RequireAuth>
            <RequireRole role="manager">
              <AppLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<ManagerDashboard />} />
        <Route path="employees" element={<EmployeesTable />} />
        <Route path="employees/profile/:id" element={<EmployeeProfile />} />
        <Route path="employees/create" element={<CreateWorkersForm />} />
        <Route path="attendance" element={<AttendanceDashboard />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="profile" element={<MyProfile />} />
      </Route>

      {/* ================= WORKER ================= */}
      <Route
        path="/worker"
        element={
          <RequireAuth>
            <RequireRole role="worker">
              <WorkerDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />

      {/* ================= DEFAULT ================= */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
