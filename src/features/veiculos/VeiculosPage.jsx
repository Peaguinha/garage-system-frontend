import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../../shared/components/Icon";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import ToastStack from "../../shared/components/ToastStack";
import { useToast } from "../../shared/hooks/useToast";
import { clientesApi } from "../clientes/clientesApi";
import { veiculosApi } from "./veiculosApi";
import VeiculoFormModal from "./VeiculoFormModal";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

// Feature F3 — Clientes & Veículos (Garage System - Fase 2 Frontend.md).
// Assim como em ClientesPage: /api/veiculos não é restrita por papel no
// backend (roleMiddleware não é aplicado nessa rota), então nenhuma ação
// aqui é escondida por RequireRole — todo usuário autenticado pode usar.
export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toasts, showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [veiculosData, clientesData] = await Promise.all([veiculosApi.list(), clientesApi.list()]);
      setVeiculos(veiculosData);
      setClientes(clientesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return veiculos;
    return veiculos.filter(
      (v) =>
        v.placa?.toLowerCase().includes(q) ||
        v.modelo?.toLowerCase().includes(q) ||
        v.marca?.toLowerCase().includes(q) ||
        v.clienteId?.nome?.toLowerCase().includes(q)
    );
  }, [veiculos, search]);

  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(veiculo) {
    setEditing(veiculo);
    setFormOpen(true);
  }

  function handleSaved(_veiculo, isEdit) {
    showToast(isEdit ? "Veículo atualizado com sucesso." : "Veículo cadastrado com sucesso.");
    load();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await veiculosApi.remove(deleting._id);
      showToast("Veículo excluído com sucesso.");
      setDeleting(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section>
      <div className="view-header">
        <div>
          <h1>Veículos</h1>
          <div className="desc">Frota cadastrada, vinculada a cada cliente.</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" />
          Novo veículo
        </button>
      </div>

      <div className="search-box" style={{ marginBottom: "1.1rem", maxWidth: 360 }}>
        <Icon name="search" />
        <input
          placeholder="Buscar por placa, modelo, marca ou cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="card card-pad">Carregando veículos...</div>}
      {!loading && error && (
        <div className="card card-pad" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="dtable dtable-veiculos">
          <div className="drow drow-head">
            <div>Placa</div>
            <div>Modelo</div>
            <div>Ano</div>
            <div>Cor</div>
            <div>Cliente</div>
            <div />
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon name="car" size="lg" />
              <p>{search ? "Nenhum veículo encontrado." : "Nenhum veículo cadastrado ainda."}</p>
            </div>
          )}

          {filtered.map((v) => {
            const isOpen = expanded.has(v._id);
            return (
              <Fragment key={v._id}>
                <div className="drow drow-body clickable" onClick={() => toggleExpand(v._id)}>
                  <div className="dcell">
                    <span className="lbl">Placa</span>
                    <span className="plate">
                      <span>{v.placa}</span>
                    </span>
                  </div>
                  <div className="dcell dcell-title">
                    <span className="lbl">Modelo</span>
                    {v.marca} {v.modelo}
                  </div>
                  <div className="dcell">
                    <span className="lbl">Ano</span>
                    {v.ano}
                  </div>
                  <div className="dcell">
                    <span className="lbl">Cor</span>
                    {v.cor || "—"}
                  </div>
                  <div className="dcell">
                    <span className="lbl">Cliente</span>
                    {v.clienteId?.nome || "—"}
                  </div>
                  <div className="dactions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost"
                      onClick={() => openEdit(v)}
                      aria-label="Editar veículo"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-danger-ghost"
                      onClick={() => setDeleting(v)}
                      aria-label="Excluir veículo"
                    >
                      <Icon name="trash" />
                    </button>
                    <Icon name="chev-r" className={`chev-toggle${isOpen ? " open" : ""}`} />
                  </div>
                </div>

                {isOpen && (
                  <div className="drow-expand">
                    <div className="drow-expand-grid">
                      <div>
                        <div className="field-label">Cliente</div>
                        <div className="mini-card">
                          <Icon name="users" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: ".85rem" }}>
                              {v.clienteId?.nome || "Cliente não encontrado"}
                            </div>
                            <div className="dcell-sub">
                              {v.clienteId?.cpf}
                              {v.clienteId?.telefone ? ` · ${v.clienteId.telefone}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="field-label">Cadastrado em</div>
                        <div className="readtext">{formatDate(v.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}

      <VeiculoFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        veiculo={editing}
        clientes={clientes}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Excluir veículo"
        message={`Tem certeza que deseja excluir a placa "${deleting?.placa}"? Essa ação não pode ser desfeita.`}
      />

      <ToastStack toasts={toasts} />
    </section>
  );
}
