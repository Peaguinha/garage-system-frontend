import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Icon from "../shared/components/Icon";
import RequireRole from "../shared/components/RequireRole";
import { useAuth } from "../shared/hooks/useAuth";
import { useTheme } from "../shared/hooks/useTheme";
import { NAV_ITEMS, BOTTOM_NAV_PATHS } from "./navConfig";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

// Casca da aplicação autenticada: rail fixo no desktop, drawer off-canvas +
// barra inferior no mobile (mesmo padrão responsivo do protótipo V2).
// As telas de cada feature entram via <Outlet/> dentro de <main className="view">.
export default function AppLayout() {
  const [railOpen, setRailOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const bottomItems = NAV_ITEMS.filter((item) => BOTTOM_NAV_PATHS.includes(item.to));

  return (
    <div id="app">
      <div className={`scrim${railOpen ? " show" : ""}`} onClick={() => setRailOpen(false)} />

      <aside className={`rail${railOpen ? " open" : ""}`}>
        <div className="rail-brand">
          <Icon name="wrench" size="lg" />
          <div className="rail-brand-word">
            Garage
            <br />
            System
            <small>Oficina mecânica</small>
          </div>
        </div>

        <nav className="rail-nav" aria-label="Navegação principal">
          <div className="rail-section-label">Oficina</div>
          {NAV_ITEMS.map((item) => (
            <RequireRole key={item.to} roles={item.roles}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                onClick={() => setRailOpen(false)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            </RequireRole>
          ))}
        </nav>

        <div className="rail-foot">
          <div className="crachá">
            <div className="avatar">{user ? initials(user.nome) : "--"}</div>
            <div className="crachá-meta">
              <div className="crachá-name">{user?.nome}</div>
              <div className="crachá-role">{user?.role}</div>
            </div>
          </div>
          <button
            className="btn btn-outline btn-block btn-sm"
            style={{ color: "var(--rail-ink)", borderColor: "var(--rail-border)" }}
            onClick={handleLogout}
          >
            <Icon name="logout" /> Sair
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <button
            className="btn btn-icon btn-ghost hamburger"
            aria-label="Abrir menu"
            onClick={() => setRailOpen(true)}
          >
            <Icon name="menu" size="lg" />
          </button>
          <div className="topbar-spacer" />
          <button className="btn btn-icon btn-ghost" aria-label="Notificações" title="Notificações">
            <Icon name="bell" />
          </button>
          <button className="btn btn-icon btn-ghost" aria-label="Alternar tema" onClick={toggleTheme}>
            <Icon name={theme === "dark" ? "moon" : "sun"} />
          </button>
        </header>

        <main className="view">
          <Outlet />
        </main>

        <nav className="bottom-nav" aria-label="Navegação inferior">
          {bottomItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `bn-item${isActive ? " active" : ""}`}>
              <Icon name={item.icon} />
              <span>{item.label.split(" ")[0]}</span>
            </NavLink>
          ))}
          <button className="bn-item" onClick={() => setRailOpen(true)}>
            <Icon name="menu" />
            <span>Mais</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
