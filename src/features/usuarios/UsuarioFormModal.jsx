import { useState } from "react";
import Modal from "../../shared/components/Modal";
import { usuariosApi } from "./usuariosApi";

const EMPTY = { nome: "", email: "", senha: "", role: "ATENDENTE" };

// Mounted only while open, so the form always starts empty without an effect.
export default function UsuarioFormModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const saved = await usuariosApi.create(form);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      icon="shield"
      title="Novo usuário"
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="usuario-form" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar usuário"}
          </button>
        </>
      }
    >
      <form id="usuario-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="usuarioNome">Nome</label>
          <input
            id="usuarioNome"
            value={form.nome}
            onChange={set("nome")}
            required
            autoFocus
            placeholder="Nome completo"
          />
        </div>
        <div className="field">
          <label htmlFor="usuarioEmail">E-mail</label>
          <input
            id="usuarioEmail"
            type="email"
            value={form.email}
            onChange={set("email")}
            required
            placeholder="pessoa@garagesystem.com"
          />
        </div>
        <div className="field">
          <label htmlFor="usuarioSenha">Senha</label>
          <input
            id="usuarioSenha"
            type="password"
            value={form.senha}
            onChange={set("senha")}
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>
        <div className="field">
          <label htmlFor="usuarioRole">Papel</label>
          <select id="usuarioRole" value={form.role} onChange={set("role")} required>
            <option value="ADMIN">ADMIN</option>
            <option value="ATENDENTE">ATENDENTE</option>
            <option value="MECANICO">MECANICO</option>
          </select>
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: ".85rem" }}>{error}</p>}
      </form>
    </Modal>
  );
}
