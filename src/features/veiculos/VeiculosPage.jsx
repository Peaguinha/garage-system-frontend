import FeaturePlaceholder from "../../shared/components/FeaturePlaceholder";

// Feature F3 — ver Garage System - Fase 2 Frontend.md
export default function VeiculosPage() {
  return (
    <FeaturePlaceholder
      icon="car"
      title="Veículos"
      description="Frota cadastrada, vinculada a cada cliente."
      owner="Igor Araújo"
      endpoints={["GET/POST/PUT/DELETE /veiculos"]}
    />
  );
}
