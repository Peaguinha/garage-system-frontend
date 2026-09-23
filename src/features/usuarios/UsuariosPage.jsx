import Icon from "../../shared/components/Icon";
import FeaturePlaceholder from "../../shared/components/FeaturePlaceholder";
import { useAuth, can } from "../../shared/hooks/useAuth";

// Feature F6 — restrita a ADMIN. O backend não tem rota REST para usuários,
// só GraphQL (ver Garage System - Fase 2 Frontend.md, "Exceção: tela de Usuários").
export default function UsuariosPage() {
  const { user } = useAuth();

  if (!can(user?.role, ["ADMIN"])) {
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
    <FeaturePlaceholder
      icon="shield"
      title="Usuários"
      description="Consulta restrita ao perfil ADMIN."
      owner="Nathan Esley"
      endpoints={["GraphQL: query { usuarios }"]}
    />
  );
}
