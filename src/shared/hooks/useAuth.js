import { useContext } from "react";
import { AuthContext } from "../../app/AuthContext";

// Uso: const { user, login, logout, isAuthenticated } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  }
  return ctx;
}

// Espelha o roleMiddleware do backend (backend/src/middlewares/roleMiddleware.js):
// cada rota/ação é liberada para uma lista de papéis específica.
// Uso: can(user?.role, ["ADMIN", "ATENDENTE"])
export function can(userRole, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
