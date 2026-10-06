import { useEffect } from "react";
import Icon from "../../shared/components/Icon";
import { STATUS_LABEL, codigoOrdem, fmtDate, fmtMoney, totais } from "./ordensApi";

// Se outra feature (Clientes/Veículos, Peças...) precisar destes componentes,
// o certo é mover para src/shared/components/ — ver "Regra de ouro" no README.
// O Dashboard reaproveita Plate, StatusPill e LinhaOrdem daqui.

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

// Linha da tabela de ordens (colunas: OS, Veículo, Proprietário, Mecânico, Status, Valor, Data).
export function LinhaOrdem({ ordem, onAbrir }) {
  const { total } = totais(ordem);
  const v = ordem.veiculo;
  return (
    <div className="drow drow-body clickable" onClick={onAbrir}>
      <div className="dcell mono dcell-title">{codigoOrdem(ordem.id)}</div>
      <div className="dcell">
        <span className="lbl">Veículo</span>
        {v && <Plate placa={v.placa} />} <span className="dcell-sub">{v ? `${v.marca} ${v.modelo}` : ""}</span>
      </div>
      <div className="dcell">
        <span className="lbl">Proprietário</span>
        {v?.cliente?.nome ?? "—"}
      </div>
      <div className="dcell">
        <span className="lbl">Mecânico</span>
        {ordem.mecanico?.nome ?? "—"}
      </div>
      <div className="dcell">
        <span className="lbl">Status</span>
        <StatusPill status={ordem.status} />
      </div>
      <div className="dcell mono tabular">
        <span className="lbl">Valor</span>
        {fmtMoney(total)}
      </div>
      <div className="dcell dcell-sub">
        <span className="lbl">Data</span>
        {fmtDate(ordem.dataAbertura)}
      </div>
    </div>
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
