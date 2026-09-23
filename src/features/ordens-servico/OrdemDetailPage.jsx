import { useParams } from "react-router-dom";
import FeaturePlaceholder from "../../shared/components/FeaturePlaceholder";

// Feature F4 — detalhe de uma ordem (stepper de status, serviços/peças, total).
// Roteado em /ordens-servico/:id — ver AppRoutes.jsx.
export default function OrdemDetailPage() {
  const { id } = useParams();
  return (
    <FeaturePlaceholder
      icon="clipboard"
      title={`Ordem de Serviço · ${id}`}
      description="Stepper de status, serviços/peças utilizados e cálculo do valor total."
      owner="Kaik"
      endpoints={["GET/PUT /ordens-servico/:id"]}
    />
  );
}
