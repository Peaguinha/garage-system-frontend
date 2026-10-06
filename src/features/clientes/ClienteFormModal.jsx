import { useEffect, useState } from "react";
import Modal from "../../shared/components/Modal";
import { clientesApi } from "./clientesApi";

const EMPTY = { nome: "", cpf: "", telefone: "", email: "", endereco: "" };

export default function ClienteFormModal({ open, onClose, onSaved, cliente }) {
  const isEdit = Boolean(cliente);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      cliente
        ? {
            nome: cliente.nome ?? "",
            cpf: cliente.cpf ?? "",
            telefone: cliente.telefone ?? "",
            email: cliente.email ?? "",
            endereco: cliente.endereco ?? "",
          }
        : EMPTY
    );
    setError(null);
  }, [open, cliente]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const saved = isEdit ? await clientesApi.update(cliente._id, form) : await clientesApi.create(form);
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
      icon="users"
      title={isEdit ? "Editar cliente" : "Novo cliente"}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="cliente-form" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      <form id="cliente-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="clienteNome">Nome</label>
          <input id="clienteNome" value={form.nome} onChange={set("nome")} required autoFocus />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="clienteCpf">CPF</label>
            <input id="clienteCpf" value={form.cpf} onChange={set("cpf")} required />
          </div>
          <div className="field">
            <label htmlFor="clienteTelefone">Telefone</label>
            <input id="clienteTelefone" value={form.telefone} onChange={set("telefone")} required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="clienteEmail">E-mail</label>
          <input id="clienteEmail" type="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="field">
          <label htmlFor="clienteEndereco">Endereço</label>
          <input id="clienteEndereco" value={form.endereco} onChange={set("endereco")} />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: ".85rem" }}>{error}</p>}
      </form>
    </Modal>
  );
}
