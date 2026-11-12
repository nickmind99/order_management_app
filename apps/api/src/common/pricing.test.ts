import { describe, expect, it } from 'vitest';
import { operationsTotalCents, orderTotalCents, suppliesTotalCents } from './pricing';

const order = {
  operations: [{ priceCents: 1500 }, { priceCents: null }, { priceCents: 2500 }],
  supplies: [
    { qty: 2, unitPriceCents: 300 },
    { qty: 1, unitPriceCents: 450 },
  ],
};

describe('pricing', () => {
  it('sums operation prices and treats null as zero', () => {
    expect(operationsTotalCents(order)).toBe(4000);
  });

  it('sums supplies as qty times unit price', () => {
    expect(suppliesTotalCents(order)).toBe(1050);
  });

  it('adds operations and supplies into the order total', () => {
    expect(orderTotalCents(order)).toBe(5050);
  });

  it('returns zero for an empty order', () => {
    expect(orderTotalCents({ operations: [], supplies: [] })).toBe(0);
  });
});
