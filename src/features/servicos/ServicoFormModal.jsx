import { useEffect, useState } from "react";
import Modal from "../../shared/components/Modal";
import { servicosApi } from "./servicosApi";

const EMPTY = { nome: "", descricao: "", valor: "" };

export default function ServicoFormModal({ open, onClose, onSaved, servico }) {
  const isEdit = Boolean(servico);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      servico
        ? { nome: servico.nome ?? "", descricao: servico.descricao ?? "", valor: String(servico.valor ?? "") }
        : EMPTY
    );
    setError(null);
  }, [open, servico]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = { nome: form.nome, descricao: form.descricao, valor: Number(form.valor) };
    try {
      const saved = isEdit ? await servicosApi.update(servico._id, payload) : await servicosApi.create(payload);
      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="tool"
      title={isEdit ? "Editar serviço" : "Novo serviço"}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="servico-form" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : isEdit ? "Salvar" : "Cadastrar serviço"}
          </button>
        </>
      }
    >
      <form id="servico-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="servicoNome">Nome</label>
          <input id="servicoNome" value={form.nome} onChange={set("nome")} required autoFocus placeholder="Troca de óleo" />
        </div>
        <div className="field">
          <label htmlFor="servicoDescricao">Descrição</label>
          <input
            id="servicoDescricao"
            value={form.descricao}
            onChange={set("descricao")}
            placeholder="Troca de óleo e filtro"
          />
        </div>
        <div className="field">
          <label htmlFor="servicoValor">Valor (R$)</label>
          <input
            id="servicoValor"
            type="number"
            min="0.01"
            step="0.01"
            value={form.valor}
            onChange={set("valor")}
            required
            placeholder="150"
          />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: ".85rem" }}>{error}</p>}
      </form>
    </Modal>
  );
}
