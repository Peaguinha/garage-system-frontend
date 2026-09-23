import { useEffect, useState } from "react";

const STORAGE_KEY = "gs-theme";

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY); // "light" | "dark" | null (segue o sistema)
  } catch {
    return null;
  }
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Espelha a lógica de tema do protótipo V2: data-theme explícito manda,
// senão segue prefers-color-scheme do sistema.
export function useTheme() {
  const [theme, setTheme] = useState(() => readStoredTheme());

  useEffect(() => {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
    else document.documentElement.removeAttribute("data-theme");
  }, [theme]);

  function toggleTheme() {
    const isDarkNow = theme === "dark" || (!theme && systemPrefersDark());
    const next = isDarkNow ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // sem persistência — o tema ainda muda nesta sessão
    }
  }

  const isDark = theme === "dark" || (!theme && systemPrefersDark());
  return { theme: isDark ? "dark" : "light", toggleTheme };
}
