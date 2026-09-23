import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useAuth } from "../../shared/hooks/useAuth";

// POST /api/auth/login (ver backend/README.md) — sem atalhos de papel como
// no protótipo: aqui é usuário/senha reais, cadastrados no backend.
export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, senha);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch {
      // erro já fica disponível em `error`, vindo do AuthContext
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <Icon name="wrench" size="lg" />
          <div>
            <div className="login-logo-word">Garage System</div>
            <div className="login-logo-tag">Gestão de oficina mecânica</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="loginEmail">E-mail</label>
            <input
              id="loginEmail"
              type="email"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="loginSenha">Senha</label>
            <input
              id="loginSenha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: "var(--danger)", fontSize: ".85rem", marginBottom: ".9rem" }}>{error}</p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <Icon name="chev-r" />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
