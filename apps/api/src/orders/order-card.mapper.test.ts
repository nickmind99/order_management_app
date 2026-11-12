import { describe, expect, it } from 'vitest';
import { toOrderCard } from './order-card.mapper';

type Row = Parameters<typeof toOrderCard>[0];
type SubRow = Row['subOrders'][number];

function sub(overrides: Partial<SubRow>): SubRow {
  return {
    number: 'FR001700-1',
    refNumber: 'REF-1',
    palletType: 'std',
    declaredQty: 1,
    actualQty: null,
    alert: null,
    warning: null,
    truckId: null,
    ...overrides,
  };
}

function row(overrides: Partial<Row>): Row {
  return {
    id: 'order-id',
    number: 'FR001700',
    parentId: null,
    refNumber: 'REF-1000',
    type: 'cross_dock',
    subtype: 'storage',
    status: 'new',
    alert: null,
    warning: null,
    nextAction: null,
    hubId: 'hub-id',
    dockId: null,
    date: new Date('2026-11-12T10:00:00Z'),
    destination: 'Toronto, ON',
    customer: 'Acme',
    services: [],
    carrierId: null,
    truckId: null,
    palletType: 'std',
    declaredQty: 10,
    actualQty: null,
    warehouseNote: null,
    invoiceNumber: null,
    createdBy: 'User 1 · Dispatcher',
    assignedTo: null,
    comments: [],
    attachments: [],
    statusHistory: [],
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    hub: { id: 'hub-id', name: 'Markham' },
    carrier: null,
    subOrders: [],
    operations: [],
    supplies: [],
    ...overrides,
  };
}

describe('toOrderCard', () => {
  it('maps a cross-dock order from its own pallets', () => {
    const card = toOrderCard(row({ palletType: 'xl', declaredQty: 8, actualQty: 7 }));

    expect(card.pallets).toEqual({ std: 0, xl: 8 });
    expect(card.declaredQty).toBe(8);
    expect(card.actualQty).toBe(7);
    expect(card.trailers).toBeNull();
    expect(card.carrier).toBeNull();
  });

  it('sums pallets, counts and trailers over consolidation sub-orders', () => {
    const card = toOrderCard(
      row({
        type: 'consolidation',
        subtype: null,
        declaredQty: 99,
        carrier: { name: 'Northline' },
        subOrders: [
          sub({ number: 'FR001700-1', palletType: 'std', declaredQty: 4, actualQty: 4, truckId: 't1' }),
          sub({ number: 'FR001700-2', palletType: 'xl', declaredQty: 2, actualQty: 1, truckId: 't1' }),
          sub({ number: 'FR001700-3', palletType: 'std', declaredQty: 3, actualQty: 3, truckId: 't2' }),
        ],
      }),
    );

    expect(card.pallets).toEqual({ std: 7, xl: 2 });
    expect(card.declaredQty).toBe(9);
    expect(card.actualQty).toBe(8);
    expect(card.trailers).toBe(2);
    expect(card.carrier).toBe('Northline');
  });

  it('keeps actual qty empty until every sub-order is counted', () => {
    const card = toOrderCard(
      row({ type: 'consolidation', subOrders: [sub({ actualQty: 4 }), sub({ number: 'FR001700-2', actualQty: null })] }),
    );

    expect(card.actualQty).toBeNull();
  });

  it('raises flags from sub-orders and hides their truck id', () => {
    const card = toOrderCard(row({ type: 'consolidation', subOrders: [sub({ alert: 'Damaged', truckId: 't1' })] }));

    expect(card.hasAlert).toBe(true);
    expect(card.hasWarning).toBe(false);
    expect(card.subOrders[0]).not.toHaveProperty('truckId');
  });

  it('calculates the total from operations and supplies', () => {
    const card = toOrderCard(
      row({ operations: [{ priceCents: 1000 }, { priceCents: null }], supplies: [{ qty: 3, unitPriceCents: 250 }] }),
    );

    expect(card.totalCents).toBe(1750);
  });
});
