import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import RequireAuth from "./RequireAuth";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import ClientesPage from "../features/clientes/ClientesPage";
import VeiculosPage from "../features/veiculos/VeiculosPage";
import OrdensServicoPage from "../features/ordens-servico/OrdensServicoPage";
import OrdemDetailPage from "../features/ordens-servico/OrdemDetailPage";
import ServicosPage from "../features/servicos/ServicosPage";
import PecasPage from "../features/pecas/PecasPage";
import UsuariosPage from "../features/usuarios/UsuariosPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/veiculos" element={<VeiculosPage />} />
        <Route path="/ordens-servico" element={<OrdensServicoPage />} />
        <Route path="/ordens-servico/:id" element={<OrdemDetailPage />} />
        <Route path="/servicos" element={<ServicosPage />} />
        <Route path="/pecas" element={<PecasPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
