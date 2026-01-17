import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import './App.css';
import { useAuth } from "./auth/auth";
import DepartmentsTable from "./pages/Department/DepartmentsTable";
import CreateAdminForm from "./pages/Admin/Dashboard/Users/Create/CreateAdmin";
import Dashboard from "./pages/Admin/Dashboard/DashboardLayout";
import PositionsTable from "./pages/Positions/PositionTable";
import AppLayout from "./pages/Manager/Layout/Layout";

const App = () => {
  const {state} = useAuth();

  return (
    <>
      {state.user?.token && state?.user?.role === "admin" && (
        <Routes>
          <Route path="/create-department" element={<DepartmentsTable />} />
          <Route path="/create-position" element={<PositionsTable />} />
          <Route path="/create-admin" element={<CreateAdminForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
      {state.user?.token && state?.user?.role === "manager" && (
        <Routes>
          <Route path="/dashboard" element={<AppLayout />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
      {!state.user?.token && (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  );
};

export default App;
