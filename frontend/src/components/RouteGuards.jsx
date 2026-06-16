import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/** Требует аутентификации; иначе — на /login. */
export function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/** Если уже залогинен — уводим с /login и /register на дашборд. */
export function RedirectIfAuth({ children }) {
  const token = useAuthStore((s) => s.accessToken);
  if (token) return <Navigate to="/parent/dashboard" replace />;
  return children;
}
