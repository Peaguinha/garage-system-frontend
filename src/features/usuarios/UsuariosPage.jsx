import { useEffect, useMemo, useState } from "react";
import Icon from "../../shared/components/Icon";
import { useAuth, can } from "../../shared/hooks/useAuth";
import { usuariosApi } from "./usuariosApi";

const ROLE_LABEL = {
  ADMIN: "Admin",
  ATENDENTE: "Atendente",
  MECANICO: "Mecânico",
};

// Feature F6 — restrita a ADMIN. O backend não tem rota REST para usuários,
// só GraphQL (ver Garage System - Fase 2 Frontend.md, "Exceção: tela de
// Usuários"), e a própria query já é ADMIN-only no resolver
// (garage-system-backend, src/graphql/resolvers.js) — a checagem de papel abaixo replica
// essa mesma regra na UI, negando acesso antes mesmo de consultar a API.
export default function UsuariosPage() {
  const { user } = useAuth();
  const isAdmin = can(user?.role, ["ADMIN"]);

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) return undefined;

    let cancelled = false;
    usuariosApi
      .list()
      .then((data) => {
        if (!cancelled) setUsuarios(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [usuarios, search]);

  if (!isAdmin) {
    return (
      <section>
        <div className="view-header">
          <div>
            <h1>Usuários</h1>
            <div className="desc">Consulta restrita ao perfil ADMIN.</div>
          </div>
        </div>
        <div className="empty-state">
          <Icon name="lock" size="lg" />
          <h3 style={{ fontSize: "1.05rem" }}>Acesso negado</h3>
          <p>Esta área é restrita ao perfil ADMIN.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="view-header">
        <div>
          <h1>Usuários</h1>
          <div className="desc">Equipe com acesso ao sistema.</div>
        </div>
      </div>

      <div className="search-box" style={{ marginBottom: "1.1rem", maxWidth: 360 }}>
        <Icon name="search" />
        <input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div className="card card-pad">Carregando usuários...</div>}
      {!loading && error && (
        <div className="card card-pad" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="dtable dtable-usuarios">
          <div className="drow drow-head">
            <div>Nome</div>
            <div>E-mail</div>
            <div>Papel</div>
            <div />
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon name="shield" size="lg" />
              <p>{search ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado ainda."}</p>
            </div>
          )}

          {filtered.map((u) => (
            <div className="drow drow-body" key={u.id}>
              <div className="dcell dcell-title">
                <span className="lbl">Nome</span>
                {u.nome}
              </div>
              <div className="dcell">
                <span className="lbl">E-mail</span>
                {u.email}
              </div>
              <div className="dcell">
                <span className="lbl">Papel</span>
                <span className={`badge badge-role-${u.role}`}>{ROLE_LABEL[u.role] ?? u.role}</span>
              </div>
              <div />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
