import { useEffect, useState } from "react";
import Modal from "../../shared/components/Modal";
import { veiculosApi } from "./veiculosApi";

const EMPTY = { placa: "", modelo: "", marca: "", ano: "", cor: "", clienteId: "" };

export default function VeiculoFormModal({ open, onClose, onSaved, veiculo, clientes }) {
  const isEdit = Boolean(veiculo);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      veiculo
        ? {
            placa: veiculo.placa ?? "",
            modelo: veiculo.modelo ?? "",
            marca: veiculo.marca ?? "",
            ano: veiculo.ano ?? "",
            cor: veiculo.cor ?? "",
            clienteId: veiculo.clienteId?._id ?? veiculo.clienteId ?? "",
          }
        : EMPTY
    );
    setError(null);
  }, [open, veiculo]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, ano: Number(form.ano) };
      const saved = isEdit ? await veiculosApi.update(veiculo._id, payload) : await veiculosApi.create(payload);
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
      icon="car"
      title={isEdit ? "Editar veículo" : "Novo veículo"}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="veiculo-form" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      <form id="veiculo-form" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="veiculoPlaca">Placa</label>
            <input
              id="veiculoPlaca"
              value={form.placa}
              onChange={set("placa")}
              required
              autoFocus
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <div className="field">
            <label htmlFor="veiculoAno">Ano</label>
            <input id="veiculoAno" type="number" value={form.ano} onChange={set("ano")} required />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="veiculoMarca">Marca</label>
            <input id="veiculoMarca" value={form.marca} onChange={set("marca")} required />
          </div>
          <div className="field">
            <label htmlFor="veiculoModelo">Modelo</label>
            <input id="veiculoModelo" value={form.modelo} onChange={set("modelo")} required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="veiculoCor">Cor</label>
          <input id="veiculoCor" value={form.cor} onChange={set("cor")} />
        </div>
        <div className="field">
          <label htmlFor="veiculoCliente">Cliente</label>
          <select id="veiculoCliente" value={form.clienteId} onChange={set("clienteId")} required disabled={!clientes.length}>
            <option value="">Selecione...</option>
            {clientes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nome} — {c.cpf}
              </option>
            ))}
          </select>
          {!clientes.length && <p className="hint">Cadastre um cliente antes de adicionar um veículo.</p>}
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: ".85rem" }}>{error}</p>}
      </form>
    </Modal>
  );
}
