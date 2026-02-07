import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/auth";

const RoleRoute = () => {
  const { state } = useAuth();

  if (!state.user?.token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
