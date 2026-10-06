import { useCallback, useRef, useState } from "react";

let nextId = 1;

// Toasts locais por página — qualquer feature que precise de feedback de
// sucesso/erro usa `const { toasts, showToast } = useToast()` e renderiza
// <ToastStack toasts={toasts} /> uma vez na tela.
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const showToast = useCallback((message, type = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, 3500);
  }, []);

  return { toasts, showToast };
}
