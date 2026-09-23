// Itens da navegação principal (rail no desktop, drawer + bottom-nav no mobile).
// `roles` omitido = visível para qualquer papel logado.
export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/ordens-servico", label: "Ordens de Serviço", icon: "clipboard" },
  { to: "/clientes", label: "Clientes", icon: "users" },
  { to: "/veiculos", label: "Veículos", icon: "car" },
  { to: "/servicos", label: "Serviços", icon: "tool" },
  { to: "/pecas", label: "Peças", icon: "box" },
  { to: "/usuarios", label: "Usuários", icon: "shield", roles: ["ADMIN"] },
];

// Os 4 destinos mais usados, exibidos na barra inferior no mobile
// (o resto fica acessível pelo drawer, aberto pelo hamburger).
export const BOTTOM_NAV_PATHS = ["/dashboard", "/ordens-servico", "/clientes", "/veiculos"];
