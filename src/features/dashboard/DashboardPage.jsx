import FeaturePlaceholder from "../../shared/components/FeaturePlaceholder";

// Feature F2 — ver Garage System - Fase 2 Frontend.md
export default function DashboardPage() {
  return (
    <FeaturePlaceholder
      icon="dashboard"
      title="Dashboard"
      description="KPIs, funil de status e últimas ordens de serviço."
      owner="Washingtton Lucena"
      endpoints={["GET /ordens-servico", "GET /pecas"]}
    />
  );
}
