const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatMoney(value) {
  return brl.format(Number(value) || 0);
}
