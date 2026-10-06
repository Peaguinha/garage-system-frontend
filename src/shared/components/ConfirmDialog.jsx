import Modal from "./Modal";

// Confirmação genérica de ação destrutiva (excluir cliente, veículo, etc.) —
// reaproveitável por qualquer feature que precise de um "tem certeza?".
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  message,
  confirmLabel = "Excluir",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="alert"
      title={title}
      maxWidth="380px"
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: "var(--danger)" }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Excluindo..." : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: ".9rem", color: "var(--ink-muted)" }}>{message}</p>
    </Modal>
  );
}
