import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useAuth, can } from "../../shared/hooks/useAuth";
import {
  PAPEIS,
  STATUS_LABEL,
  STATUS_ORDEM,
  TRANSICOES,
  atualizarStatus,
  codigoOrdem,
  criarOrdem,
  fmtDate,
  fmtMoney,
  initials,
  listarMecanicos,
  listarOrdens,
  listarVeiculos,
  totais,
} from "./ordensApi";
import { Modal, Plate, StatusPill } from "./ui";
import { useToast } from "./useToast";

// Feature F4 — Ordens de Serviço (lista): kanban, lista e abertura de ordem.
export default function OrdensServicoPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast, toastStack } = useToast();

  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modo, setModo] = useState("kanban");
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const podeCriar = can(user?.role, PAPEIS.criarOrdem);
  const podeArrastar = can(user?.role, PAPEIS.avancarStatus);

  const carregar = useCallback(async () => {
    try {
      setError(null);
      setOrdens(await listarOrdens(token));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const colunas = mostrarCanceladas ? [...STATUS_ORDEM, "CANCELADA"] : STATUS_ORDEM;

  const visiveis = useMemo(
    () =>
      (mostrarCanceladas ? ordens : ordens.filter((o) => o.status !== "CANCELADA")).toSorted((a, b) =>
        String(b.dataAbertura).localeCompare(String(a.dataAbertura)),
      ),
    [ordens, mostrarCanceladas],
  );

  async function moverOrdem(ordemId, novoStatus) {
    const ordem = ordens.find((o) => o.id === ordemId);
    if (!ordem || ordem.status === novoStatus) return;

    // Mesma regra do backend: só avança para o próximo passo do fluxo.
    if (!TRANSICOES[ordem.status].includes(novoStatus)) {
      toast(`Não é possível mover de ${STATUS_LABEL[ordem.status]} para ${STATUS_LABEL[novoStatus]}.`, "error");
      return;
    }
    try {
      await atualizarStatus(ordemId, novoStatus);
      toast(`${codigoOrdem(ordemId)} movida para ${STATUS_LABEL[novoStatus]}.`);
      await carregar();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  const abrirOrdem = (id) => navigate(`/ordens-servico/${id}`);

  if (loading) {
    return (
      <section>
        <Cabecalho podeCriar={false} />
        <p className="dcell-sub">Carregando ordens de serviço…</p>
      </section>
    );
  }

  return (
    <section>
      <Cabecalho podeCriar={podeCriar} onNova={() => setModalAberto(true)} />

      {error && (
        <div className="info-banner" role="alert">
          <Icon name="alert" />
          <span>Não foi possível carregar as ordens: {error}</span>
          <button className="btn btn-outline btn-sm" onClick={carregar}>
            Tentar de novo
          </button>
        </div>
      )}

      <div className="kanban-toolbar">
        <div className="seg">
          <button
            className={modo === "kanban" ? "active" : ""}
            onClick={() => setModo("kanban")}
            title="Visualização em quadro"
            aria-label="Kanban"
          >
            <Icon name="kanban" />
          </button>
          <button
            className={modo === "lista" ? "active" : ""}
            onClick={() => setModo("lista")}
            title="Visualização em lista"
            aria-label="Lista"
          >
            <Icon name="menu" /> Lista
          </button>
        </div>
        <button
          className="filter-chip"
          aria-pressed={mostrarCanceladas}
          onClick={() => setMostrarCanceladas((v) => !v)}
        >
          <Icon name="x" style={{ width: ".9em", height: ".9em" }} />
          Mostrar canceladas
        </button>
        {podeArrastar && modo === "kanban" && (
          <span className="dcell-sub" style={{ marginLeft: ".2rem" }}>
            Arraste um cartão para a próxima coluna para avançar o status.
          </span>
        )}
      </div>

      {modo === "kanban" ? (
        <div className="kanban">
          {colunas.map((status) => {
            const itens = ordens.filter((o) => o.status === status);
            return (
              <div className="kcol" key={status}>
                <div className="kcol-head">
                  <StatusPill status={status} />
                  <span className="kcol-count">{itens.length}</span>
                </div>
                <div
                  className={`kcol-body${dragOver === status ? " drag-over" : ""}`}
                  onDragOver={(e) => {
                    if (!draggingId) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOver(status);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(null);
                    const id = e.dataTransfer.getData("text/plain");
                    setDraggingId(null);
                    moverOrdem(id, status);
                  }}
                >
                  {itens.length === 0 && (
                    <div className="dcell-sub" style={{ padding: ".6rem", textAlign: "center" }}>
                      Vazio
                    </div>
                  )}
                  {itens.map((o) => (
                    <CartaoOrdem
                      key={o.id}
                      ordem={o}
                      arrastavel={podeArrastar}
                      arrastando={draggingId === o.id}
                      onAbrir={() => abrirOrdem(o.id)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", o.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(o.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOver(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dtable dtable-ordens">
          <div className="drow drow-head">
            <div>OS</div>
            <div>Veículo</div>
            <div>Proprietário</div>
            <div>Mecânico</div>
            <div>Status</div>
            <div>Valor</div>
            <div>Data</div>
          </div>
          {visiveis.length === 0 && (
            <div className="empty-state">
              <Icon name="clipboard" size="lg" />
              <h3 style={{ fontSize: "1.05rem" }}>Nenhuma ordem de serviço</h3>
            </div>
          )}
          {visiveis.map((o) => (
            <LinhaOrdem key={o.id} ordem={o} onAbrir={() => abrirOrdem(o.id)} />
          ))}
        </div>
      )}

      {podeCriar && (
        <NovaOrdemModal
          open={modalAberto}
          onClose={() => setModalAberto(false)}
          ordens={ordens}
          onCriada={async (id) => {
            setModalAberto(false);
            toast(`${codigoOrdem(id)} aberta com sucesso.`);
            await carregar();
          }}
          onErro={(msg) => toast(msg, "error")}
        />
      )}

      {toastStack}
    </section>
  );
}

function Cabecalho({ podeCriar, onNova }) {
  return (
    <div className="view-header">
      <div>
        <h1>Ordens de Serviço</h1>
        <div className="desc">Fluxo: Aberta → Em diagnóstico → Aguardando aprovação → Em execução → Concluída.</div>
      </div>
      {podeCriar && (
        <button className="btn btn-primary" onClick={onNova}>
          <Icon name="plus" /> Nova ordem
        </button>
      )}
    </div>
  );
}

function CartaoOrdem({ ordem, arrastavel, arrastando, onAbrir, onDragStart, onDragEnd }) {
  const { total } = totais(ordem);
  return (
    <button
      className={`kcard${arrastando ? " dragging" : ""}`}
      draggable={arrastavel}
      onClick={onAbrir}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="kcard-top">
        <span className="kcard-id mono">{codigoOrdem(ordem.id)}</span>
        {ordem.veiculo && <Plate placa={ordem.veiculo.placa} />}
      </div>
      <div style={{ fontWeight: 700, fontSize: ".85rem" }}>{ordem.veiculo?.cliente?.nome ?? "—"}</div>
      <div className="kcard-problem">{ordem.descricaoProblema}</div>
      <div className="kcard-foot">
        <span
          className="avatar"
          style={{ width: "1.7em", height: "1.7em", fontSize: ".62rem" }}
          title={ordem.mecanico?.nome}
        >
          {initials(ordem.mecanico?.nome)}
        </span>
        <span className="kcard-value mono">{fmtMoney(total)}</span>
      </div>
    </button>
  );
}

function LinhaOrdem({ ordem, onAbrir }) {
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

function NovaOrdemModal({ open, onClose, ordens, onCriada, onErro }) {
  const { user, token } = useAuth();
  const [veiculos, setVeiculos] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [veiculoId, setVeiculoId] = useState("");
  const [mecanicoId, setMecanicoId] = useState("");
  const [problema, setProblema] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Só ADMIN consegue consultar `usuarios` no GraphQL. Para ATENDENTE usamos os
  // mecânicos que já aparecem nas ordens existentes (limitação do backend — ver PR).
  const mecanicosDasOrdens = useMemo(() => {
    const mapa = new Map();
    ordens.forEach((o) => o.mecanico && mapa.set(o.mecanico.id, o.mecanico));
    return [...mapa.values()];
  }, [ordens]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelado = false;
    (async () => {
      try {
        const vs = await listarVeiculos(token);
        if (!cancelado) setVeiculos(vs);
        const ms = user?.role === "ADMIN" ? await listarMecanicos(token) : mecanicosDasOrdens;
        if (!cancelado) setMecanicos(ms);
      } catch (err) {
        onErro(err.message);
      }
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      const nova = await criarOrdem({ veiculoId, mecanicoId, descricaoProblema: problema.trim() });
      setVeiculoId("");
      setMecanicoId("");
      setProblema("");
      await onCriada(nova._id);
    } catch (err) {
      onErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} icon="clipboard" title="Nova ordem de serviço">
      <form onSubmit={enviar}>
        <div className="modal-body">
          <div className="field">
            <label htmlFor="osFormVeiculo">Veículo</label>
            <select id="osFormVeiculo" required value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
              <option value="" disabled>
                Selecione…
              </option>
              {veiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.marca} {v.modelo}
                  {v.cliente?.nome ? ` (${v.cliente.nome})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="osFormMecanico">Mecânico responsável</label>
            <select id="osFormMecanico" required value={mecanicoId} onChange={(e) => setMecanicoId(e.target.value)}>
              <option value="" disabled>
                Selecione…
              </option>
              {mecanicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
            {mecanicos.length === 0 && (
              <div className="hint">Nenhum mecânico disponível para seleção com o seu perfil.</div>
            )}
          </div>
          <div className="field">
            <label htmlFor="osFormProblema">Descrição do problema</label>
            <textarea
              id="osFormProblema"
              rows={3}
              required
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              placeholder="Veículo apresenta ruído anormal no motor"
            />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? "Abrindo…" : "Abrir ordem"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
