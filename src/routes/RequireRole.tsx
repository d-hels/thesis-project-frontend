// src/routes/RequireRole.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/auth";
import type { JSX } from "react";

const RequireRole = ({
  role,
  children,
}: {
  role: "admin" | "manager" | "worker";
  children: JSX.Element;
}) => {
  const { state } = useAuth();
  if (state.user?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireRole;
