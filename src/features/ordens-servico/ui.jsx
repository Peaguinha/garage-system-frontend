import { useEffect } from "react";
import Icon from "../../shared/components/Icon";
import { STATUS_LABEL } from "./ordensApi";

// Se outra feature (Clientes/Veículos, Peças...) precisar destes componentes,
// o certo é mover para src/shared/components/ — ver "Regra de ouro" no README.

export function Plate({ placa }) {
  return (
    <span className="plate">
      <span>{placa}</span>
    </span>
  );
}

export function StatusPill({ status }) {
  return (
    <span className={`status-pill status-${status}`}>
      <span className="dot" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Modal({ open, onClose, icon, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`modal-overlay${open ? " show" : ""}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <Icon name={icon} size="lg" style={{ color: "var(--accent)" }} />
          <h3>{title}</h3>
        </div>
        {open && children}
      </div>
    </div>
  );
}
