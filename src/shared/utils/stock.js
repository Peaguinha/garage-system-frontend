// A part with fewer units than this is flagged as low stock (V2 prototype rule).
export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(quantity) {
  return quantity < LOW_STOCK_THRESHOLD;
}
