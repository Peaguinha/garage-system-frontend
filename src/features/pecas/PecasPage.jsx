import { useEffect, useMemo, useState } from "react";
import Icon from "../../shared/components/Icon";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import ToastStack from "../../shared/components/ToastStack";
import { useToast } from "../../shared/hooks/useToast";
import { useAuth, can } from "../../shared/hooks/useAuth";
import { formatMoney } from "../../shared/utils/format";
import { pecasApi } from "./pecasApi";
import PecaFormModal from "./PecaFormModal";

// Same threshold the V2 prototype and the dashboard KPI use for "low stock".
const LOW_STOCK_THRESHOLD = 5;

// Feature F5 (parts half) — everyone can read the stock; the backend
// restricts POST/PUT/DELETE /api/pecas to ADMIN, so the UI hides those
// actions for the other roles.
export default function PecasPage() {
  const { user } = useAuth();
  const isAdmin = can(user?.role, ["ADMIN"]);

  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toasts, showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    pecasApi
      .list()
      .then((data) => {
        if (!cancelled) {
          setPecas(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pecas;
    return pecas.filter(
      (p) =>
        p.nome?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q) ||
        p.fabricante?.toLowerCase().includes(q)
    );
  }, [pecas, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(peca) {
    setEditing(peca);
    setFormOpen(true);
  }

  function handleSaved(_peca, isEdit) {
    showToast(isEdit ? "Peça atualizada com sucesso." : "Peça cadastrada com sucesso.");
    setReloadKey((k) => k + 1);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await pecasApi.remove(deleting._id);
      showToast("Peça excluída com sucesso.");
      setDeleting(null);
      setReloadKey((k) => k + 1);
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
          <h1>Peças</h1>
          <div className="desc">Estoque simplificado de peças da oficina.</div>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" />
            Nova peça
          </button>
        )}
      </div>

      <div className="search-box" style={{ marginBottom: "1.1rem", maxWidth: 360 }}>
        <Icon name="search" />
        <input
          placeholder="Buscar por nome, código ou fabricante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="card card-pad">Carregando peças...</div>}
      {!loading && error && (
        <div className="card card-pad" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="dtable dtable-pecas">
          <div className="drow drow-head">
            <div>Nome</div>
            <div>Código</div>
            <div>Fabricante</div>
            <div>Preço</div>
            <div>Estoque</div>
            <div />
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon name="box" size="lg" />
              <p>{search ? "Nenhuma peça encontrada." : "Nenhuma peça cadastrada ainda."}</p>
            </div>
          )}

          {filtered.map((p) => {
            const lowStock = p.quantidadeDisponivel < LOW_STOCK_THRESHOLD;
            return (
              <div className="drow drow-body" key={p._id}>
                <div className="dcell dcell-title">
                  <span className="lbl">Nome</span>
                  {p.nome}
                </div>
                <div className="dcell mono">
                  <span className="lbl">Código</span>
                  {p.codigo || "—"}
                </div>
                <div className="dcell">
                  <span className="lbl">Fabricante</span>
                  {p.fabricante || "—"}
                </div>
                <div className="dcell mono tabular">
                  <span className="lbl">Preço</span>
                  {formatMoney(p.preco)}
                </div>
                <div className="dcell">
                  <span className="lbl">Estoque</span>
                  <span className={`badge ${lowStock ? "badge-low" : "badge-neutral"}`}>
                    {p.quantidadeDisponivel} un.{lowStock ? " · baixo" : ""}
                  </span>
                </div>
                {isAdmin ? (
                  <div className="dactions">
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost"
                      onClick={() => openEdit(p)}
                      aria-label="Editar peça"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-danger-ghost"
                      onClick={() => setDeleting(p)}
                      aria-label="Excluir peça"
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            );
          })}
        </div>
      )}

      <PecaFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={handleSaved} peca={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Excluir peça"
        message={`Tem certeza que deseja excluir "${deleting?.nome}"? Essa ação não pode ser desfeita.`}
      />

      <ToastStack toasts={toasts} />
    </section>
  );
}
