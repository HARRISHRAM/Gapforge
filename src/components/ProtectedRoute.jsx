import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../App";

/**
 * Wraps routes that require authentication.
 * Unauthenticated users are redirected to /login with the attempted path saved.
 */
export default function ProtectedRoute({ children }) {
  const { state } = useApp();
  const location = useLocation();

  if (!state.user && !state.authToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
