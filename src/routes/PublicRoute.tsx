import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/auth";

const PublicRoute = ({ children }: any) => {
    const { state } = useAuth();

  if (state.user?.token) {
    if (state.user?.role === "admin") return <Navigate to="/dashboard" replace />;
    if (state.user?.role === "manager") return <Navigate to="/manager" replace />;
    if (state.user?.role === "worker") return <Navigate to="/worker" replace />;
  }

  return children;
};

export default PublicRoute;
