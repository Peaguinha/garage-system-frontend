import { useAuth, can } from "../hooks/useAuth";

// Esconde o conteúdo por completo quando o papel do usuário logado não está
// na lista `roles` — mesmo comportamento do protótipo V2 (Anexo 4: omitir,
// nunca só desabilitar). Ex.:
//   <RequireRole roles={["ADMIN"]}>
//     <button className="btn btn-primary">Novo usuário</button>
//   </RequireRole>
export default function RequireRole({ roles, children, fallback = null }) {
  const { user } = useAuth();
  return can(user?.role, roles) ? children : fallback;
}
