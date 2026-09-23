import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";

// Envolve as rotas protegidas em AppRoutes.jsx. Sem sessão válida, manda
// para /login e lembra de onde o usuário veio (útil para redirecionar de volta).
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
