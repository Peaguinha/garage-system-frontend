import FeaturePlaceholder from "../../shared/components/FeaturePlaceholder";

// Feature F3 — ver Garage System - Fase 2 Frontend.md
export default function ClientesPage() {
  return (
    <FeaturePlaceholder
      icon="users"
      title="Clientes"
      description="Cadastro de clientes e seus veículos vinculados."
      owner="Igor Araújo"
      endpoints={["GET/POST/PUT/DELETE /clientes"]}
    />
  );
}
