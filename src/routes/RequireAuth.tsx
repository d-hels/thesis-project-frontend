// src/routes/RequireAuth.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/auth";
import type { JSX } from "react";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { state } = useAuth();

  if (!state.user?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
