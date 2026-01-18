import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function AdminGateRoute({ children }: Props) {
  const token = sessionStorage.getItem("admin_gate_token");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
