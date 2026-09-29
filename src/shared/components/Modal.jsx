import { useEffect } from "react";
import Icon from "./Icon";

// Modal genérico (overlay + card), usado pelos formulários de cadastro/edição
// e por confirmações em qualquer feature — ver .modal / .modal-overlay em
// shared/styles/base.css, extraído do protótipo V2. Não duplicar por feature.
export default function Modal({ open, onClose, icon, title, children, footer, maxWidth }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay show"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        style={maxWidth ? { maxWidth } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-head">
          {icon && <Icon name={icon} />}
          <h3 id="modal-title" style={{ flex: 1 }}>
            {title}
          </h3>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fechar">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
