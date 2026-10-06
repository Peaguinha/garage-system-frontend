import { useEffect, useState } from "react";
import Modal from "../../shared/components/Modal";
import { pecasApi } from "./pecasApi";

const EMPTY = { nome: "", codigo: "", fabricante: "", preco: "", quantidadeDisponivel: "" };

export default function PecaFormModal({ open, onClose, onSaved, peca }) {
  const isEdit = Boolean(peca);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      peca
        ? {
            nome: peca.nome ?? "",
            codigo: peca.codigo ?? "",
            fabricante: peca.fabricante ?? "",
            preco: String(peca.preco ?? ""),
            quantidadeDisponivel: String(peca.quantidadeDisponivel ?? ""),
          }
        : EMPTY
    );
    setError(null);
  }, [open, peca]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      nome: form.nome,
      codigo: form.codigo,
      fabricante: form.fabricante,
      preco: Number(form.preco),
      quantidadeDisponivel: Number(form.quantidadeDisponivel),
    };
    try {
      const saved = isEdit ? await pecasApi.update(peca._id, payload) : await pecasApi.create(payload);
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
      icon="box"
      title={isEdit ? "Editar peça" : "Nova peça"}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="peca-form" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : isEdit ? "Salvar" : "Cadastrar peça"}
          </button>
        </>
      }
    >
      <form id="peca-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="pecaNome">Nome</label>
          <input id="pecaNome" value={form.nome} onChange={set("nome")} required autoFocus placeholder="Filtro de óleo" />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="pecaCodigo">Código</label>
            <input id="pecaCodigo" value={form.codigo} onChange={set("codigo")} required placeholder="FLT001" />
          </div>
          <div className="field">
            <label htmlFor="pecaFabricante">Fabricante</label>
            <input id="pecaFabricante" value={form.fabricante} onChange={set("fabricante")} required placeholder="Bosch" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="pecaPreco">Preço (R$)</label>
            <input
              id="pecaPreco"
              type="number"
              min="0.01"
              step="0.01"
              value={form.preco}
              onChange={set("preco")}
              required
              placeholder="45"
            />
          </div>
          <div className="field">
            <label htmlFor="pecaQtd">Qtd. disponível</label>
            <input
              id="pecaQtd"
              type="number"
              min="0"
              step="1"
              value={form.quantidadeDisponivel}
              onChange={set("quantidadeDisponivel")}
              required
              placeholder="10"
            />
          </div>
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: ".85rem" }}>{error}</p>}
      </form>
    </Modal>
  );
}
