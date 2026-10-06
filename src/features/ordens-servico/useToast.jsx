import { useCallback, useRef, useState } from "react";
import Icon from "../../shared/components/Icon";

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const toast = useCallback((message, kind = "ok") => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, kind }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3500);
  }, []);

  const toastStack = (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <Icon name={t.kind === "error" ? "alert" : "check"} style={t.kind === "error" ? { color: "var(--danger)" } : undefined} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );

  return { toast, toastStack };
}
