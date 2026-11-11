type Priced = { operations: { priceCents: number | null }[]; supplies: { qty: number; unitPriceCents: number }[] };

export function operationsTotalCents(order: Pick<Priced, 'operations'>): number {
  return order.operations.reduce((sum, op) => sum + (op.priceCents ?? 0), 0);
}

export function suppliesTotalCents(order: Pick<Priced, 'supplies'>): number {
  return order.supplies.reduce((sum, s) => sum + s.qty * s.unitPriceCents, 0);
}

export function orderTotalCents(order: Priced): number {
  return operationsTotalCents(order) + suppliesTotalCents(order);
}
