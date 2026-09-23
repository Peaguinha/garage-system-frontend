import FeaturePlaceholder from "../../shared/components/FeaturePlaceholder";

// Feature F4 — ver Garage System - Fase 2 Frontend.md
// Kanban (com drag-and-drop) + Lista. O detalhe de uma ordem específica
// fica em OrdemDetailPage.jsx, roteado em /ordens-servico/:id.
export default function OrdensServicoPage() {
  return (
    <FeaturePlaceholder
      icon="clipboard"
      title="Ordens de Serviço"
      description="Fluxo: Aberta → Em diagnóstico → Aguardando aprovação → Em execução → Concluída."
      owner="Kaik"
      endpoints={["GET/POST /ordens-servico"]}
    />
  );
}
