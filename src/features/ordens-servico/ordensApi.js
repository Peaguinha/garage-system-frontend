// Camada de dados da feature Ordens de Serviço (F4).
//
// Leitura: GraphQL (/graphql). A REST de ordens só popula o veículo, e a tela
// precisa do proprietário (cliente) e do nome do mecânico — o GraphQL entrega
// tudo numa única consulta e já devolve `id` (a REST devolve `_id`).
// Escrita: REST (/api/ordens-servico), que concentra as regras de negócio.

import { api } from "../../shared/api/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || API_URL.replace(/\/api\/?$/, "") + "/graphql";

// O token vive no AuthContext; o client REST já o guarda internamente, mas não o expõe.
// Por isso a leitura do GraphQL recebe o token explicitamente.
export async function gql(query, variables, token) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok || payload?.errors?.length) {
    throw new Error(payload?.errors?.[0]?.message || `Erro ${res.status} ao consultar o GraphQL`);
  }
  return payload.data;
}

const ORDEM_FIELDS = `
  id
  status
  descricaoProblema
  diagnostico
  valorTotal
  dataAbertura
  dataConclusao
  veiculo { id placa marca modelo ano cor cliente { id nome telefone } }
  mecanico { id nome }
  servicos { servicoId nome valor }
  pecas { pecaId nome quantidade precoUnitario }
`;

export async function listarOrdens(token) {
  const data = await gql(`query { ordensServico { ${ORDEM_FIELDS} } }`, undefined, token);
  return data.ordensServico;
}

export async function buscarOrdem(id, token) {
  const data = await gql(`query($id: ID!) { ordemServico(id: $id) { ${ORDEM_FIELDS} } }`, { id }, token);
  return data.ordemServico;
}

export async function listarCatalogos(token) {
  const data = await gql(
    `query {
      servicos { id nome valor }
      pecas { id nome preco quantidadeDisponivel }
    }`,
    undefined,
    token,
  );
  return data;
}

export async function listarVeiculos(token) {
  const data = await gql(`query { veiculos { id placa marca modelo cliente { nome } } }`, undefined, token);
  return data.veiculos;
}

// Só o perfil ADMIN pode consultar `usuarios` no GraphQL.
export async function listarMecanicos(token) {
  const data = await gql(`query { usuarios { id nome role } }`, undefined, token);
  return data.usuarios.filter((u) => u.role === "MECANICO");
}

// ---- Escrita (REST) ----
export const criarOrdem = (body) => api.post("/ordens-servico", body);
export const atualizarDiagnostico = (id, diagnostico) => api.put(`/ordens-servico/${id}`, { diagnostico });
export const atualizarStatus = (id, status) => api.patch(`/ordens-servico/${id}/status`, { status });
export const adicionarServico = (id, servicoId) => api.patch(`/ordens-servico/${id}/servicos`, { servicoId });
export const adicionarPeca = (id, pecaId, quantidade) =>
  api.patch(`/ordens-servico/${id}/pecas`, { pecaId, quantidade });

// ---- Regras espelhadas do backend (backend/src/services/ordemServicoService.js) ----
export const STATUS_ORDEM = ["ABERTA", "EM_DIAGNOSTICO", "AGUARDANDO_APROVACAO", "EM_EXECUCAO", "CONCLUIDA"];

export const STATUS_LABEL = {
  ABERTA: "Aberta",
  EM_DIAGNOSTICO: "Em diagnóstico",
  AGUARDANDO_APROVACAO: "Aguard. aprovação",
  EM_EXECUCAO: "Em execução",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const TRANSICOES = {
  ABERTA: ["EM_DIAGNOSTICO", "CANCELADA"],
  EM_DIAGNOSTICO: ["AGUARDANDO_APROVACAO", "CANCELADA"],
  AGUARDANDO_APROVACAO: ["EM_EXECUCAO", "CANCELADA"],
  EM_EXECUCAO: ["CONCLUIDA", "CANCELADA"],
  CONCLUIDA: [],
  CANCELADA: [],
};

export const isFinal = (status) => status === "CONCLUIDA" || status === "CANCELADA";

// Quem pode o quê (mesma matriz do protótipo V2). O backend ainda não aplica
// roleMiddleware nas rotas de ordem, então esta é a única barreira por perfil.
export const PAPEIS = {
  criarOrdem: ["ADMIN", "ATENDENTE"],
  avancarStatus: ["ADMIN", "MECANICO"],
  cancelarOrdem: ["ADMIN", "ATENDENTE"],
  editarDiagnostico: ["ADMIN", "MECANICO"],
};

// ---- Formatação ----
export const fmtMoney = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function initials(nome = "") {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

// O backend não tem número sequencial de OS; usamos os 4 últimos caracteres do id.
export const codigoOrdem = (id = "") => `OS-${id.slice(-4).toUpperCase()}`;

export function totais(ordem) {
  const subServicos = ordem.servicos.reduce((soma, s) => soma + s.valor, 0);
  const subPecas = ordem.pecas.reduce((soma, p) => soma + p.precoUnitario * p.quantidade, 0);
  return { subServicos, subPecas, total: subServicos + subPecas };
}
