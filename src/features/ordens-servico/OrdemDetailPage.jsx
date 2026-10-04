import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useAuth, can } from "../../shared/hooks/useAuth";
import {
  PAPEIS,
  STATUS_LABEL,
  STATUS_ORDEM,
  adicionarPeca,
  adicionarServico,
  atualizarDiagnostico,
  atualizarStatus,
  buscarOrdem,
  codigoOrdem,
  fmtDate,
  fmtMoney,
  initials,
  isFinal,
  listarCatalogos,
  totais,
} from "./ordensApi";
import { Plate, StatusPill } from "./ui";
import { useToast } from "./useToast";

// Feature F4 — detalhe de uma ordem (stepper de status, serviços/peças, total).
export default function OrdemDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast, toastStack } = useToast();

  const [ordem, setOrdem] = useState(null);
  const [catalogos, setCatalogos] = useState({ servicos: [], pecas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diagnostico, setDiagnostico] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [pecaId, setPecaId] = useState("");
  const [qtd, setQtd] = useState(1);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setError(null);
      const [o, c] = await Promise.all([buscarOrdem(id, token), listarCatalogos(token)]);
      if (!o) throw new Error("Ordem de serviço não encontrada");
      setOrdem(o);
      setDiagnostico(o.diagnostico || "");
      setCatalogos(c);
      setServicoId((atual) => atual || c.servicos[0]?.id || "");
      setPecaId((atual) => atual || c.pecas[0]?.id || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Executa uma ação de escrita, avisa o resultado e recarrega a ordem.
  async function executar(acao, mensagemOk) {
    setOcupado(true);
    try {
      await acao();
      if (mensagemOk) toast(mensagemOk);
      await carregar();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setOcupado(false);
    }
  }

  const voltar = (
    <button className="back-btn" onClick={() => navigate("/ordens-servico")}>
      <Icon name="chev-l" /> Ordens de serviço
    </button>
  );

  if (loading) {
    return (
      <section>
        {voltar}
        <p className="dcell-sub" style={{ marginTop: ".7rem" }}>
          Carregando ordem…
        </p>
      </section>
    );
  }

  if (error || !ordem) {
    return (
      <section>
        {voltar}
        <div className="info-banner" role="alert" style={{ marginTop: ".7rem" }}>
          <Icon name="alert" />
          <span>{error || "Ordem de serviço não encontrada"}</span>
          <button className="btn btn-outline btn-sm" onClick={carregar}>
            Tentar de novo
          </button>
        </div>
      </section>
    );
  }

  const v = ordem.veiculo;
  const { subServicos, subPecas, total } = totais(ordem);
  const cancelada = ordem.status === "CANCELADA";
  const finalizada = isFinal(ordem.status);
  const idx = STATUS_ORDEM.indexOf(ordem.status);
  const proximo = STATUS_ORDEM[idx + 1];

  const podeAvancar = can(user?.role, PAPEIS.avancarStatus) && !finalizada;
  // Mesmo critério do protótipo: cancelar só antes de o serviço entrar em execução.
  const podeCancelar =
    can(user?.role, PAPEIS.cancelarOrdem) && (ordem.status === "ABERTA" || ordem.status === "EM_DIAGNOSTICO");
  const podeEditarDiagnostico = can(user?.role, PAPEIS.editarDiagnostico) && !finalizada;

  const estoquePeca = catalogos.pecas.find((p) => p.id === pecaId)?.quantidadeDisponivel ?? 0;

  return (
    <section>
      {voltar}

      <div className="os-head" style={{ marginTop: ".7rem" }}>
        <h1 className="mono" style={{ fontSize: "1.4rem" }}>
          {codigoOrdem(ordem.id)}
        </h1>
        {v && <Plate placa={v.placa} />}
        <StatusPill status={ordem.status} />
        <div style={{ flex: 1 }} />
        {can(user?.role, PAPEIS.cancelarOrdem) && (
          <button
            className="btn btn-danger-ghost btn-sm"
            disabled={!podeCancelar || ocupado}
            onClick={() => executar(() => atualizarStatus(ordem.id, "CANCELADA"), "Ordem cancelada.")}
          >
            Cancelar ordem
          </button>
        )}
        {can(user?.role, PAPEIS.avancarStatus) && (
          <button
            className="btn btn-primary btn-sm"
            disabled={!podeAvancar || ocupado}
            onClick={() =>
              executar(
                () => atualizarStatus(ordem.id, proximo),
                `Status atualizado para ${STATUS_LABEL[proximo]}.`,
              )
            }
          >
            Avançar status <Icon name="chev-r" />
          </button>
        )}
      </div>

      {cancelada ? (
        <div className="cancel-banner">
          <Icon name="x" />
          <span>Ordem cancelada · aberta em {fmtDate(ordem.dataAbertura)}</span>
        </div>
      ) : (
        <div className="stepper">
          {STATUS_ORDEM.map((st, i) => {
            const cls = i < idx ? "done" : i === idx ? "current" : "";
            return (
              <div className={`step ${cls}`} key={st}>
                <div className="step-line" />
                <div className="step-dot">
                  {i < idx ? <Icon name="check" style={{ width: "1em", height: "1em" }} /> : i + 1}
                </div>
                <div className="step-label">{STATUS_LABEL[st]}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="os-grid">
        <div>
          <div className="card card-pad" style={{ marginBottom: "1rem" }}>
            <div className="section-title">Veículo &amp; cliente</div>
            <div className="vehicle-strip">
              <Icon name="car" size="lg" style={{ color: "var(--steel)" }} />
              <div>
                <div style={{ fontWeight: 700 }}>
                  {v ? `${v.marca} ${v.modelo}${v.ano ? ` · ${v.ano}` : ""}${v.cor ? ` · ${v.cor}` : ""}` : "—"}
                </div>
                <div className="dcell-sub">
                  {v?.cliente ? `${v.cliente.nome}${v.cliente.telefone ? ` · ${v.cliente.telefone}` : ""}` : "—"}
                </div>
              </div>
            </div>

            <div className="field-block">
              <div className="field-label">Mecânico responsável</div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5em" }}>
                <div className="avatar" style={{ width: "1.9em", height: "1.9em", fontSize: ".7rem" }}>
                  {initials(ordem.mecanico?.nome) || "--"}
                </div>
                <span>{ordem.mecanico?.nome ?? "—"}</span>
              </div>
            </div>

            <div className="field-block">
              <div className="field-label">Descrição do problema</div>
              <p className="readtext">{ordem.descricaoProblema}</p>
            </div>

            <div className="field-block">
              <div className="field-label">Diagnóstico</div>
              <textarea
                rows={3}
                value={diagnostico}
                readOnly={!podeEditarDiagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                onBlur={() => {
                  if (podeEditarDiagnostico && diagnostico !== (ordem.diagnostico || "")) {
                    executar(() => atualizarDiagnostico(ordem.id, diagnostico), "Diagnóstico atualizado.");
                  }
                }}
                style={{
                  width: "100%",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 8,
                  padding: ".6em .75em",
                  background: "var(--surface)",
                }}
                placeholder="Ainda sem diagnóstico registrado…"
              />
              <div className="hint">Editável por Mecânico e Admin.</div>
            </div>

            <div className="field-block" style={{ marginBottom: 0 }}>
              <div className="field-label">Abertura / conclusão</div>
              <div className="dcell-sub">
                Aberta em {fmtDate(ordem.dataAbertura)} ·{" "}
                {ordem.dataConclusao ? `Concluída em ${fmtDate(ordem.dataConclusao)}` : "em andamento"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: "1rem" }}>
            <div className="section-title">Serviços</div>
            {ordem.servicos.length === 0 ? (
              <p className="dcell-sub">Nenhum serviço adicionado ainda.</p>
            ) : (
              ordem.servicos.map((s, i) => (
                <div className="line-item-row" key={`${s.servicoId}-${i}`}>
                  <span className="line-item-name">{s.nome}</span>
                  <span className="line-item-value mono">{fmtMoney(s.valor)}</span>
                </div>
              ))
            )}
            {!finalizada && (
              <div className="add-line-row">
                <select
                  value={servicoId}
                  onChange={(e) => setServicoId(e.target.value)}
                  style={{ flex: 1, minWidth: 160 }}
                  aria-label="Serviço"
                >
                  {catalogos.servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — {fmtMoney(s.valor)}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={!servicoId || ocupado}
                  onClick={() => executar(() => adicionarServico(ordem.id, servicoId), "Serviço adicionado à ordem.")}
                >
                  <Icon name="plus" /> Adicionar
                </button>
              </div>
            )}
          </div>

          <div className="card card-pad" style={{ marginBottom: "1rem" }}>
            <div className="section-title">Peças utilizadas</div>
            {ordem.pecas.length === 0 ? (
              <p className="dcell-sub">Nenhuma peça utilizada ainda.</p>
            ) : (
              ordem.pecas.map((p, i) => (
                <div className="line-item-row" key={`${p.pecaId}-${i}`}>
                  <span className="line-item-name">
                    {p.nome}
                    <span className="line-item-meta">
                      {" "}
                      · {p.quantidade} un. × {fmtMoney(p.precoUnitario)}
                    </span>
                  </span>
                  <span className="line-item-value mono">{fmtMoney(p.quantidade * p.precoUnitario)}</span>
                </div>
              ))
            )}
            {!finalizada && (
              <div className="add-line-row">
                <select
                  value={pecaId}
                  onChange={(e) => setPecaId(e.target.value)}
                  style={{ flex: 1, minWidth: 160 }}
                  aria-label="Peça"
                >
                  {catalogos.pecas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — {fmtMoney(p.preco)} ({p.quantidadeDisponivel} un.)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={qtd}
                  onChange={(e) => setQtd(e.target.value)}
                  style={{ width: 70 }}
                  aria-label="Quantidade"
                />
                <button
                  className="btn btn-outline btn-sm"
                  disabled={!pecaId || ocupado}
                  onClick={() => {
                    const n = Math.max(1, parseInt(qtd, 10) || 1);
                    if (n > estoquePeca) {
                      toast(`Estoque insuficiente: apenas ${estoquePeca} un. disponíveis.`, "error");
                      return;
                    }
                    executar(() => adicionarPeca(ordem.id, pecaId, n), "Peça adicionada à ordem.");
                  }}
                >
                  <Icon name="plus" /> Adicionar
                </button>
              </div>
            )}
          </div>

          <div className="card card-pad">
            <div className="section-title">Resumo financeiro</div>
            <div className="totals-box" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
              <div className="totals-row">
                <span>Subtotal serviços</span>
                <span className="mono tabular">{fmtMoney(subServicos)}</span>
              </div>
              <div className="totals-row">
                <span>Subtotal peças</span>
                <span className="mono tabular">{fmtMoney(subPecas)}</span>
              </div>
              <div className="totals-row grand">
                <span>Total da ordem</span>
                <span className="val tabular">{fmtMoney(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toastStack}
    </section>
  );
}
