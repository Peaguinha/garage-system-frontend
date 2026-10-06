import { useEffect, useMemo, useState } from "react";
import Icon from "../../shared/components/Icon";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import ToastStack from "../../shared/components/ToastStack";
import { useToast } from "../../shared/hooks/useToast";
import { useAuth, can } from "../../shared/hooks/useAuth";
import { formatMoney } from "../../shared/utils/format";
import { servicosApi } from "./servicosApi";
import ServicoFormModal from "./ServicoFormModal";

// Feature F5 (services half) — everyone can read the catalog; the backend
// restricts POST/PUT/DELETE /api/servicos to ADMIN, so the UI hides those
// actions for the other roles.
export default function ServicosPage() {
  const { user } = useAuth();
  const isAdmin = can(user?.role, ["ADMIN"]);

  const [servicos, setServicos] = useState([]);
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
    servicosApi
      .list()
      .then((data) => {
        if (!cancelled) {
          setServicos(data);
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
    if (!q) return servicos;
    return servicos.filter((s) => s.nome?.toLowerCase().includes(q) || s.descricao?.toLowerCase().includes(q));
  }, [servicos, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(servico) {
    setEditing(servico);
    setFormOpen(true);
  }

  function handleSaved(_servico, isEdit) {
    showToast(isEdit ? "Serviço atualizado com sucesso." : "Serviço cadastrado com sucesso.");
    setReloadKey((k) => k + 1);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await servicosApi.remove(deleting._id);
      showToast("Serviço excluído com sucesso.");
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
          <h1>Serviços</h1>
          <div className="desc">Catálogo de serviços oferecidos pela oficina.</div>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" />
            Novo serviço
          </button>
        )}
      </div>

      <div className="search-box" style={{ marginBottom: "1.1rem", maxWidth: 360 }}>
        <Icon name="search" />
        <input placeholder="Buscar por nome ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div className="card card-pad">Carregando serviços...</div>}
      {!loading && error && (
        <div className="card card-pad" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="dtable dtable-servicos">
          <div className="drow drow-head">
            <div>Nome</div>
            <div>Descrição</div>
            <div>Valor</div>
            <div />
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon name="tool" size="lg" />
              <p>{search ? "Nenhum serviço encontrado." : "Nenhum serviço cadastrado ainda."}</p>
            </div>
          )}

          {filtered.map((s) => (
            <div className="drow drow-body" key={s._id}>
              <div className="dcell dcell-title">
                <span className="lbl">Nome</span>
                {s.nome}
              </div>
              <div className="dcell dcell-sub">
                <span className="lbl">Descrição</span>
                {s.descricao || "—"}
              </div>
              <div className="dcell mono tabular">
                <span className="lbl">Valor</span>
                {formatMoney(s.valor)}
              </div>
              {isAdmin ? (
                <div className="dactions">
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost"
                    onClick={() => openEdit(s)}
                    aria-label="Editar serviço"
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-icon btn-danger-ghost"
                    onClick={() => setDeleting(s)}
                    aria-label="Excluir serviço"
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>
      )}

      <ServicoFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={handleSaved} servico={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Excluir serviço"
        message={`Tem certeza que deseja excluir "${deleting?.nome}"? Essa ação não pode ser desfeita.`}
      />

      <ToastStack toasts={toasts} />
    </section>
  );
}
