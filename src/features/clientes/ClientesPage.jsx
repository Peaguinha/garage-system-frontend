import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../../shared/components/Icon";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import ToastStack from "../../shared/components/ToastStack";
import { useToast } from "../../shared/hooks/useToast";
import { clientesApi } from "./clientesApi";
import { veiculosApi } from "../veiculos/veiculosApi";
import ClienteFormModal from "./ClienteFormModal";

// Feature F3 — Clientes & Veículos (Garage System - Fase 2 Frontend.md).
// Backend não restringe /api/clientes por papel (roleMiddleware não é
// aplicado nessas rotas — ver backend/src/routes/clienteRoutes.js), então
// qualquer usuário autenticado (ADMIN/ATENDENTE/MECANICO) vê e usa as ações
// abaixo sem restrição extra na UI, espelhando o backend.
export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
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
      const [clientesData, veiculosData] = await Promise.all([clientesApi.list(), veiculosApi.list()]);
      setClientes(clientesData);
      setVeiculos(veiculosData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const veiculosPorCliente = useMemo(() => {
    const map = new Map();
    for (const v of veiculos) {
      const clienteId = v.clienteId?._id ?? v.clienteId;
      if (!clienteId) continue;
      if (!map.has(clienteId)) map.set(clienteId, []);
      map.get(clienteId).push(v);
    }
    return map;
  }, [veiculos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nome?.toLowerCase().includes(q) ||
        c.cpf?.toLowerCase().includes(q) ||
        c.telefone?.toLowerCase().includes(q)
    );
  }, [clientes, search]);

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

  function openEdit(cliente) {
    setEditing(cliente);
    setFormOpen(true);
  }

  function handleSaved(_cliente, isEdit) {
    showToast(isEdit ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.");
    load();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await clientesApi.remove(deleting._id);
      showToast("Cliente excluído com sucesso.");
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
          <h1>Clientes</h1>
          <div className="desc">Cadastro de clientes e seus veículos vinculados.</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" />
          Novo cliente
        </button>
      </div>

      <div className="search-box" style={{ marginBottom: "1.1rem", maxWidth: 360 }}>
        <Icon name="search" />
        <input
          placeholder="Buscar por nome, CPF ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="card card-pad">Carregando clientes...</div>}
      {!loading && error && (
        <div className="card card-pad" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="dtable dtable-clientes">
          <div className="drow drow-head">
            <div>Nome</div>
            <div>CPF</div>
            <div>Telefone</div>
            <div>Veículos</div>
            <div />
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon name="users" size="lg" />
              <p>{search ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}</p>
            </div>
          )}

          {filtered.map((c) => {
            const isOpen = expanded.has(c._id);
            const veiculosDoCliente = veiculosPorCliente.get(c._id) ?? [];
            return (
              <Fragment key={c._id}>
                <div className="drow drow-body clickable" onClick={() => toggleExpand(c._id)}>
                  <div className="dcell dcell-title">
                    <span className="lbl">Nome</span>
                    {c.nome}
                  </div>
                  <div className="dcell">
                    <span className="lbl">CPF</span>
                    {c.cpf}
                  </div>
                  <div className="dcell">
                    <span className="lbl">Telefone</span>
                    {c.telefone}
                  </div>
                  <div className="dcell">
                    <span className="lbl">Veículos</span>
                    {veiculosDoCliente.length}
                  </div>
                  <div className="dactions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost"
                      onClick={() => openEdit(c)}
                      aria-label="Editar cliente"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-danger-ghost"
                      onClick={() => setDeleting(c)}
                      aria-label="Excluir cliente"
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
                        <div className="field-label">E-mail</div>
                        <div className="readtext">{c.email || "—"}</div>
                      </div>
                      <div>
                        <div className="field-label">Endereço</div>
                        <div className="readtext">{c.endereco || "—"}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      <div className="field-label">Veículos vinculados</div>
                      {veiculosDoCliente.length === 0 ? (
                        <p className="hint">Nenhum veículo cadastrado para este cliente.</p>
                      ) : (
                        veiculosDoCliente.map((v) => (
                          <div className="mini-card" key={v._id}>
                            <span className="plate">
                              <span>{v.placa}</span>
                            </span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: ".85rem" }}>
                                {v.marca} {v.modelo}
                              </div>
                              <div className="dcell-sub">
                                {v.ano}
                                {v.cor ? ` · ${v.cor}` : ""}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}

      <ClienteFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        cliente={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir "${deleting?.nome}"? Essa ação não pode ser desfeita.`}
      />

      <ToastStack toasts={toasts} />
    </section>
  );
}
