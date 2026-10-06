import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useAuth, can } from "../../shared/hooks/useAuth";
import { isLowStock } from "../../shared/utils/stock";
import { STATUS_ORDEM, fmtMoney, listarOrdens, totais } from "../ordens-servico/ordensApi";
import { LinhaOrdem, StatusPill } from "../ordens-servico/ui";
import { pecasApi } from "../pecas/pecasApi";

// Feature F2 — overview of the workshop: KPIs, orders by status and the latest
// service orders, following the V2 prototype. Orders come from GraphQL (the same
// query the orders screen uses, which already carries customer and mechanic);
// the low-stock KPI comes from GET /api/pecas.
const RECENT_LIMIT = 6;
const FUNNEL_STATUSES = [...STATUS_ORDEM, "CANCELADA"];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const canCreate = can(user?.role, ["ADMIN", "ATENDENTE"]);

  const [ordens, setOrdens] = useState([]);
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listarOrdens(token), pecasApi.list()])
      .then(([ordensData, pecasData]) => {
        if (cancelled) return;
        setOrdens(ordensData);
        setPecas(pecasData);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = useMemo(() => {
    const count = (status) => ordens.filter((o) => o.status === status).length;
    const concluidas = ordens.filter((o) => o.status === "CONCLUIDA");
    return {
      abertas: count("ABERTA"),
      execucao: count("EM_EXECUCAO"),
      concluidas: concluidas.length,
      faturamento: concluidas.reduce((sum, o) => sum + totais(o).total, 0),
      estoqueBaixo: pecas.filter((p) => isLowStock(p.quantidadeDisponivel)).length,
      porStatus: Object.fromEntries(FUNNEL_STATUSES.map((s) => [s, count(s)])),
    };
  }, [ordens, pecas]);

  const recentes = useMemo(
    () => [...ordens].sort((a, b) => String(b.dataAbertura).localeCompare(String(a.dataAbertura))).slice(0, RECENT_LIMIT),
    [ordens]
  );

  const firstName = user?.nome?.split(" ")[0];

  const kpis = [
    { label: "OS Abertas", value: stats.abertas, sub: "aguardando diagnóstico", accent: true },
    { label: "Em execução", value: stats.execucao, sub: "na baia de serviço" },
    { label: "Concluídas", value: stats.concluidas, sub: "ordens finalizadas" },
    { label: "Faturamento", value: fmtMoney(stats.faturamento), sub: "em ordens concluídas" },
    { label: "Estoque baixo", value: stats.estoqueBaixo, sub: "peças abaixo de 5 un.", warn: stats.estoqueBaixo > 0 },
  ];

  return (
    <section>
      <div className="view-header">
        <div>
          <h1>{firstName ? `Olá, ${firstName}` : "Olá"}</h1>
          <div className="desc">Aqui está o panorama da oficina hoje.</div>
        </div>
        {canCreate && (
          <div style={{ display: "flex", gap: ".6rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/clientes")}>
              <Icon name="plus" />
              Novo cliente
            </button>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/ordens-servico")}>
              <Icon name="plus" />
              Nova ordem
            </button>
          </div>
        )}
      </div>

      {loading && <div className="card card-pad">Carregando panorama da oficina...</div>}
      {!loading && error && (
        <div className="card card-pad" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="kpi-grid">
            {kpis.map((k) => (
              <div className={`kpi${k.accent ? " kpi-accent" : ""}`} key={k.label}>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value" style={k.warn ? { color: "var(--warning)" } : undefined}>
                  {k.value}
                </div>
                <div className="kpi-sub">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="section-title">Ordens por status</div>
          <div className="status-funnel">
            {FUNNEL_STATUSES.map((status) => (
              <button
                type="button"
                className="filter-chip"
                key={status}
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/ordens-servico")}
              >
                <StatusPill status={status} /> <strong className="mono">{stats.porStatus[status]}</strong>
              </button>
            ))}
          </div>

          <div className="card">
            <div className="card-pad" style={{ paddingBottom: 0 }}>
              <div className="section-title" style={{ marginBottom: ".9rem" }}>
                Últimas ordens de serviço
              </div>
            </div>
            <div className="dtable dtable-ordens" style={{ border: 0, borderRadius: 0 }}>
              <div className="drow drow-head">
                <div>OS</div>
                <div>Veículo</div>
                <div>Proprietário</div>
                <div>Mecânico</div>
                <div>Status</div>
                <div>Valor</div>
                <div>Data</div>
              </div>
              {recentes.length === 0 && (
                <div className="empty-state">
                  <Icon name="clipboard" size="lg" />
                  <h3 style={{ fontSize: "1.05rem" }}>Nenhuma ordem de serviço</h3>
                </div>
              )}
              {recentes.map((o) => (
                <LinhaOrdem key={o.id} ordem={o} onAbrir={() => navigate(`/ordens-servico/${o.id}`)} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
