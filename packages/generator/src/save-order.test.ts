import { describe, expect, it, vi } from 'vitest';
import { saveOrder } from './save-order';
import { GeneratedOrder, GeneratorContext } from './types';

const context: GeneratorContext = {
  today: '2026-11-12T10:00:00.000Z',
  hubs: [
    { id: 'hub-1', name: 'Markham', region: 'ON', docks: [{ id: 'dock-1', number: 1 }] },
    { id: 'hub-2', name: 'Toronto', region: 'ON', docks: [{ id: 'dock-2', number: 1 }] },
  ],
  carriers: [
    { id: 'carrier-1', name: 'Northline', trucks: [{ id: 'truck-1', number: 'T1', trailerType: 'dry_van' }] },
    { id: 'carrier-2', name: 'Eastway', trucks: [{ id: 'truck-2', number: 'T2', trailerType: 'reefer' }] },
  ],
};

function generated(overrides: Partial<GeneratedOrder>): GeneratedOrder {
  return {
    type: 'cross_dock',
    subtype: 'pickup',
    status: 'new',
    refNumber: 'REF-1234',
    hubId: 'hub-1',
    dockId: 'dock-1',
    date: '2026-11-13T09:00:00.000Z',
    destination: 'Toronto, ON',
    customer: 'Acme',
    services: ['Storage'],
    carrierId: 'carrier-1',
    truckId: 'truck-1',
    palletType: 'std',
    declaredQty: 6,
    createdBy: 'User 3 · Dispatcher',
    nextAction: 'Waiting for truck',
    subOrders: [],
    operations: [],
    supplies: [],
    ...overrides,
  };
}

async function save(order: GeneratedOrder) {
  const tx = {
    order: {
      create: vi.fn(async ({ data }) => ({ ...data, id: 'parent-id', number: 'FR001800' })),
      createMany: vi.fn(),
    },
    operation: { createMany: vi.fn() },
    supply: { createMany: vi.fn() },
  };
  const prisma = { $transaction: (run: (client: typeof tx) => Promise<string>) => run(tx) };
  const number = await saveOrder(prisma as never, order, context);
  return {
    number,
    parent: tx.order.create.mock.calls[0][0].data,
    subOrders: tx.order.createMany.mock.calls[0][0].data,
    operations: tx.operation.createMany.mock.calls[0][0].data,
    supplies: tx.supply.createMany.mock.calls[0][0].data,
  };
}

describe('saveOrder', () => {
  it('saves a valid cross-dock order as it is', async () => {
    const { number, parent, subOrders } = await save(generated({}));

    expect(number).toBe('FR001800');
    expect(parent).toMatchObject({ type: 'cross_dock', subtype: 'pickup', dockId: 'dock-1', truckId: 'truck-1', declaredQty: 6 });
    expect(parent.date).toEqual(new Date('2026-11-13T09:00:00.000Z'));
    expect(parent.statusHistory).toEqual([{ status: 'new', at: expect.any(Date), by: 'User 3 · Dispatcher' }]);
    expect(subOrders).toEqual([]);
  });

  it('drops ids that do not belong to the chosen hub or carrier', async () => {
    const { parent } = await save(generated({ dockId: 'dock-2', truckId: 'truck-2' }));

    expect(parent.dockId).toBeNull();
    expect(parent.truckId).toBeNull();
  });

  it('clears trucks for self pickup', async () => {
    const { parent } = await save(generated({ carrierId: 'unknown', truckId: 'truck-1' }));

    expect(parent.carrierId).toBeNull();
    expect(parent.truckId).toBeNull();
  });

  it('removes the reference number from a draft', async () => {
    const { parent } = await save(generated({ status: 'draft' }));

    expect(parent.refNumber).toBeNull();
  });

  it('fixes a missing subtype, zero pallets and an invalid date', async () => {
    const { parent } = await save(generated({ subtype: null, declaredQty: 0, date: 'tomorrow' }));

    expect(parent.subtype).toBe('storage');
    expect(parent.declaredQty).toBe(1);
    expect(parent.date).toEqual(new Date(context.today));
  });

  it('turns a consolidation without sub-orders into a cross-dock', async () => {
    const { parent } = await save(generated({ type: 'consolidation', subtype: null }));

    expect(parent.type).toBe('cross_dock');
    expect(parent.subtype).toBe('storage');
  });

  it('saves operations and supplies of the order', async () => {
    const { parent, operations, supplies } = await save(
      generated({
        operations: [
          { type: 'unloading', qty: 6, priceCents: 5000 },
          { type: 'restack', qty: 0, priceCents: null },
          { type: 'loading', qty: 6, priceCents: 4500 },
        ],
        supplies: [{ sku: 'Straps 12', category: 'securement', qty: 4, unitPriceCents: 350 }],
      }),
    );

    expect(parent.nextAction).toBe('Waiting for truck');
    expect(operations).toHaveLength(3);
    expect(operations[0]).toMatchObject({ type: 'unloading', orderId: 'parent-id', truckId: 'truck-1', palletType: 'std' });
    expect(operations[1]).toMatchObject({ type: 'restack', qty: 1, truckId: null });
    expect(operations[0].appliedAt.getTime()).toBeLessThan(operations[2].appliedAt.getTime());
    expect(supplies).toEqual([{ sku: 'Straps 12', category: 'securement', qty: 4, unitPriceCents: 350, orderId: 'parent-id' }]);
  });

  it('saves consolidation sub-orders linked to the parent', async () => {
    const { parent, subOrders } = await save(
      generated({
        type: 'consolidation',
        subtype: 'pickup',
        declaredQty: 99,
        subOrders: [
          { refNumber: 'PO-1', palletType: 'std', declaredQty: 4, truckId: 'truck-1' },
          { refNumber: 'PO-2', palletType: 'xl', declaredQty: 0, truckId: 'truck-2' },
        ],
      }),
    );

    expect(parent).toMatchObject({ type: 'consolidation', subtype: null, truckId: null, declaredQty: 5 });
    expect(subOrders).toHaveLength(2);
    expect(subOrders[0]).toMatchObject({ number: 'FR001800-1', parentId: 'parent-id', truckId: 'truck-1', declaredQty: 4 });
    expect(subOrders[1]).toMatchObject({ number: 'FR001800-2', truckId: null, declaredQty: 1 });
    expect(subOrders[1]).toMatchObject({ hubId: 'hub-1', status: 'new', customer: 'Acme', carrierId: 'carrier-1' });
  });
});
