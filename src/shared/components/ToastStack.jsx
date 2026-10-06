import Icon from "./Icon";

// Renderiza a pilha de toasts produzida por shared/hooks/useToast.js.
// Ver .toast-stack / .toast em shared/styles/base.css.
export default function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <Icon name={t.type === "error" ? "alert" : "check"} style={t.type === "error" ? { color: "var(--danger)" } : undefined} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
