import FeaturePlaceholder from "../../shared/components/FeaturePlaceholder";

// Feature F5 — ver Garage System - Fase 2 Frontend.md
export default function PecasPage() {
  return (
    <FeaturePlaceholder
      icon="box"
      title="Peças"
      description="Estoque simplificado de peças da oficina."
      owner="Israel Neto"
      endpoints={["GET/POST/PUT/DELETE /pecas"]}
    />
  );
}
