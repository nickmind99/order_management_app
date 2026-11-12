import { createPrismaClient } from '../src/client';
import type { Prisma } from '../src/generated/prisma/client';

const prisma = createPrismaClient(process.env.DATABASE_URL!);

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

function at(daysAgo: number, time = '09:00'): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(today);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(h, m);
  return d;
}

function hoursAfter(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000);
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = rng(42);
const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const pick = <T>(items: T[]): T => items[int(0, items.length - 1)];

async function main() {
  await prisma.$executeRaw`TRUNCATE hubs, docks, carriers, trucks, orders, operations, supplies CASCADE`;
  await prisma.$executeRaw`ALTER SEQUENCE order_number_seq RESTART`;

  const markham = await prisma.hub.create({
    data: {
      name: 'Markham',
      region: 'ON',
      address: '1 Logistics Way, Markham, ON',
      docks: { create: [10, 11, 12, 13, 14].map((number) => ({ number, bay: number < 12 ? 'A' : 'B' })) },
    },
    include: { docks: true },
  });
  const toronto = await prisma.hub.create({
    data: {
      name: 'Toronto',
      region: 'ON',
      address: '200 Freight Rd, Toronto, ON',
      docks: { create: [1, 2, 3, 4, 5, 6].map((number) => ({ number, bay: number < 4 ? 'A' : 'B' })) },
    },
    include: { docks: true },
  });
  const dock12 = markham.docks.find((d) => d.number === 12)!;
  const hubs = [markham, toronto];

  const rway = await prisma.carrier.create({
    data: {
      name: 'R-way Transport Inc.',
      phone: '+1 647 555 0199',
      trucks: { create: [{ number: 'TRK-4521', trailerNumber: 'TRL-8830', trailerType: 'Van · 53ft' }] },
    },
    include: { trucks: true },
  });
  const schneider = await prisma.carrier.create({
    data: {
      name: 'Schneider',
      phone: '+1 905 555 0142',
      trucks: {
        create: [
          { number: 'TRK-3310', trailerNumber: 'TRL-7702', trailerType: 'Reefer · 53ft' },
          { number: 'TRK-3318', trailerNumber: 'TRL-7715', trailerType: 'Van · 53ft' },
        ],
      },
    },
    include: { trucks: true },
  });
  const tforce = await prisma.carrier.create({
    data: {
      name: 'TForce',
      phone: '+1 416 555 0177',
      trucks: {
        create: [
          { number: 'TRK-2208', trailerNumber: 'TRL-6610', trailerType: 'Van · 53ft' },
          { number: 'TRK-2215', trailerNumber: 'TRL-6624', trailerType: 'Flatbed · 48ft' },
        ],
      },
    },
    include: { trucks: true },
  });
  const carriers = [rway, schneider, tforce];
  const rwayTruck = rway.trucks[0];
  const [tforceTruck1, tforceTruck2] = tforce.trucks;


  const orders: Prisma.OrderUncheckedCreateInput[] = [];

  const fr1383Date = at(0, '08:30');
  orders.push({
    number: 'FR001383',
    refNumber: 'REF-1012',
    type: 'cross_dock',
    subtype: 'storage',
    status: 'in_progress',
    nextAction: 'Loading',
    hubId: markham.id,
    dockId: dock12.id,
    date: fr1383Date,
    destination: 'Toronto, ON',
    customer: 'R-way Transport',
    services: ['Transload', 'Restock & Rework'],
    carrierId: rway.id,
    truckId: rwayTruck.id,
    palletType: 'std',
    declaredQty: 10,
    actualQty: 12,
    warehouseNote: 'Counted 12 pallets on arrival, BOL says 10. 1 pallet damaged → routed to Disposal.',
    createdBy: 'User 2 · Dispatcher',
    assignedTo: 'User 6 (floor lead)',
    attachments: photos('FR001383', 5),
    statusHistory: [
      { status: 'draft', at: at(1, '16:00'), by: 'User 2' },
      { status: 'new', at: at(1, '16:20'), by: 'User 2' },
      { status: 'in_progress', at: at(0, '08:42'), by: 'User 6' },
    ],
    operations: {
      create: [
        { type: 'unloading', truckId: rwayTruck.id, qty: 12, palletType: 'std', appliedAt: at(0, '08:55'), priceCents: 6000 },
        { type: 'disposal', qty: 1, palletType: 'std', appliedAt: at(0, '09:10') },
        { type: 'restack', qty: 11, palletType: 'std', appliedAt: at(0, '09:25') },
        { type: 'loading', truckId: rwayTruck.id, qty: 11, palletType: 'std', appliedAt: at(0, '10:40'), priceCents: 5500 },
      ],
    },
    supplies: {
      create: [
        { sku: 'Straps 12', category: 'securement', qty: 4, unitPriceCents: 350 },
        { sku: 'Corners 50', category: 'edge_protect', qty: 16, unitPriceCents: 120 },
        { sku: 'Shrink wrap 120g', category: 'wrap', qty: 2, unitPriceCents: 1800 },
      ],
    },
  });

  const fr1676Date = at(5, '09:00');
  orders.push({
    number: 'FR001676',
    type: 'consolidation',
    status: 'in_progress',
    nextAction: 'Loading',
    hubId: markham.id,
    date: fr1676Date,
    destination: 'Toronto, ON',
    customer: 'R-way Transport',
    services: ['Transload'],
    carrierId: tforce.id,
    palletType: 'std',
    declaredQty: 18,
    createdBy: 'User 1 · Admin',
    subOrders: {
      create: [
        subOrder('FR001676-1', 'REF-1001', 9, 'std', tforceTruck1.id),
        subOrder('FR001676-2', 'REF-1003', 6, 'std', tforceTruck1.id),
        subOrder('FR001676-3', 'REF-1002', 3, 'xl', tforceTruck2.id),
      ].map((s) => ({ ...s, status: 'in_progress', hubId: markham.id, date: fr1676Date, customer: 'R-way Transport', createdBy: 'User 1 · Admin' })),
    },
  });

  orders.push({
    number: 'FR001681',
    refNumber: 'REF-1004',
    type: 'cross_dock',
    subtype: 'storage',
    status: 'new',
    nextAction: 'Waiting for truck',
    warning: 'pickup window closes today',
    hubId: toronto.id,
    date: at(2, '14:00'),
    destination: 'Detroit, MI',
    customer: 'Great Lakes Supply',
    services: ['Transload'],
    carrierId: schneider.id,
    palletType: 'std',
    declaredQty: 23,
    createdBy: 'User 2 · Dispatcher',
    attachments: [{ kind: 'document', name: 'External PDF', key: 'orders/FR001681/external.pdf' }],
  });

  const fr1674Date = at(4, '11:00');
  orders.push({
    number: 'FR001674',
    type: 'consolidation',
    status: 'in_progress',
    nextAction: 'Loading',
    hubId: markham.id,
    date: fr1674Date,
    destination: 'Calgary, AB',
    customer: 'Northline Foods',
    services: ['Transload'],
    carrierId: tforce.id,
    palletType: 'std',
    declaredQty: 20,
    actualQty: 18,
    createdBy: 'User 3 · Dispatcher',
    subOrders: {
      create: [
        { ...subOrder('FR001674-1', 'REF-1005', 12, 'std', tforceTruck1.id), actualQty: 11 },
        { ...subOrder('FR001674-2', 'REF-1006', 8, 'std', tforceTruck1.id), actualQty: 7, alert: 'photo missing' },
      ].map((s) => ({ ...s, status: 'in_progress', hubId: markham.id, date: fr1674Date, customer: 'Northline Foods', createdBy: 'User 3 · Dispatcher', carrierId: tforce.id })),
    },
  });

  const fr1672Date = at(3, '17:30');
  orders.push({
    number: 'FR001672',
    refNumber: 'REF-1007',
    type: 'cross_dock',
    subtype: 'pickup',
    status: 'completed',
    hubId: markham.id,
    date: fr1672Date,
    destination: 'Brampton, ON',
    customer: 'Lakeshore Retail',
    services: ['Transload'],
    palletType: 'xl',
    declaredQty: 10,
    actualQty: 10,
    invoiceNumber: '001812',
    createdBy: 'User 1 · Admin',
    attachments: photos('FR001672', 3),
    completedAt: hoursAfter(fr1672Date, 2),
    operations: {
      create: [
        { type: 'unloading', qty: 10, palletType: 'xl', appliedAt: hoursAfter(fr1672Date, 0.5), priceCents: 7000 },
        { type: 'loading', qty: 10, palletType: 'xl', appliedAt: hoursAfter(fr1672Date, 1.5), priceCents: 7000 },
      ],
    },
  });

  const fr1668Date = at(6, '10:00');
  orders.push({
    number: 'FR001668',
    type: 'consolidation',
    status: 'completed',
    hubId: markham.id,
    date: fr1668Date,
    destination: 'Toronto, ON',
    customer: 'Maple Freight Co.',
    services: ['Transload'],
    carrierId: tforce.id,
    palletType: 'std',
    declaredQty: 28,
    actualQty: 28,
    invoiceNumber: '001809',
    createdBy: 'User 4 · Dispatcher',
    completedAt: hoursAfter(fr1668Date, 30),
    operations: {
      create: [{ type: 'loading', truckId: tforceTruck2.id, qty: 28, palletType: 'std', appliedAt: hoursAfter(fr1668Date, 28), priceCents: 14000 }],
    },
    subOrders: {
      create: [
        subOrder('FR001668-1', 'REF-1008', 8, 'std', tforceTruck1.id),
        subOrder('FR001668-2', 'REF-1009', 6, 'std', tforceTruck1.id),
        subOrder('FR001668-3', 'REF-1010', 8, 'std', tforceTruck2.id),
        subOrder('FR001668-4', 'REF-1011', 6, 'std', tforceTruck2.id),
      ].map((s) => ({
        ...s,
        actualQty: s.declaredQty,
        status: 'completed',
        hubId: markham.id,
        date: fr1668Date,
        customer: 'Maple Freight Co.',
        createdBy: 'User 4 · Dispatcher',
        carrierId: tforce.id,
        completedAt: hoursAfter(fr1668Date, 30),
      })),
    },
  });

  orders.push({
    number: 'DRAFT-003',
    type: 'consolidation',
    status: 'draft',
    warning: 'incomplete draft',
    hubId: markham.id,
    date: at(1, '09:00'),
    customer: 'R-way Transport',
    palletType: 'std',
    declaredQty: 0,
    createdBy: 'User 1 · Admin',
  });

  const customers = ['Maple Freight Co.', 'Northline Foods', 'Lakeshore Retail', 'Great Lakes Supply', 'Polar Beverages'];
  const destinations = ['Toronto, ON', 'Ottawa, ON', 'Hamilton, ON', 'Montreal, QC', 'Detroit, MI', 'Buffalo, NY', 'Chicago, IL'];
  const creators = ['User 1 · Admin', 'User 2 · Dispatcher', 'User 3 · Dispatcher', 'User 4 · Dispatcher'];
  let invoice = 1780;

  for (let i = 0; i < 18; i++) {
    const number = `FR00${1650 + i}`;
    const isConsolidation = i % 6 === 5;
    const active = i >= 15;
    const hub = pick(hubs);
    const carrier = pick(carriers);
    const truck = pick(carrier.trucks);
    const loadingTruck = active ? null : pick(carrier.trucks);
    const date = active ? at(int(0, 3), `${int(7, 16)}:00`) : at(int(7, 70), `${int(7, 16)}:00`);
    const palletType: 'std' | 'xl' = random() < 0.75 ? 'std' : 'xl';
    const declaredQty = int(6, 26);
    const actualQty = declaredQty + pick([0, 0, 0, 1, -1]);
    const customer = pick(customers);
    const createdBy = pick(creators);
    const completedAt = active ? null : hoursAfter(date, int(3, 30));
    const status = active ? (i === 15 ? 'new' : 'in_progress') : 'completed';

    const base = {
      number,
      status,
      hubId: hub.id,
      date,
      destination: pick(destinations),
      customer,
      services: random() < 0.5 ? ['Transload'] : ['Transload', 'Restock & Rework'],
      carrierId: carrier.id,
      palletType,
      createdBy,
      completedAt,
      invoiceNumber: active ? null : `00${invoice++}`,
    } satisfies Partial<Prisma.OrderUncheckedCreateInput>;

    if (isConsolidation) {
      const parts = [int(4, 12), int(4, 12), int(4, 12)];
      orders.push({
        ...base,
        type: 'consolidation',
        nextAction: active ? 'Consolidation' : null,
        declaredQty: parts.reduce((a, b) => a + b, 0),
        actualQty: active ? null : parts.reduce((a, b) => a + b, 0),
        operations: loadingTruck
          ? {
              create: [
                {
                  type: 'loading',
                  truckId: loadingTruck.id,
                  qty: parts.reduce((a, b) => a + b, 0),
                  palletType,
                  appliedAt: hoursAfter(date, 2),
                  priceCents: parts.reduce((a, b) => a + b, 0) * 500,
                },
              ],
            }
          : undefined,
        subOrders: {
          create: parts.map((qty, n) => ({
            ...subOrder(`${number}-${n + 1}`, `REF-${2000 + i * 10 + n}`, qty, palletType, pick(carrier.trucks).id),
            actualQty: active ? null : qty,
            status,
            hubId: hub.id,
            date,
            customer,
            createdBy,
            carrierId: carrier.id,
            completedAt,
          })),
        },
      });
      continue;
    }

    const hasAlert = i === 16;
    const operations: Prisma.OperationUncheckedCreateWithoutOrderInput[] = [];
    if (status !== 'new') {
      const op = { truckId: truck.id, qty: actualQty, palletType, priceCents: actualQty * 500 };
      operations.push({ ...op, type: 'unloading', appliedAt: hoursAfter(date, 1) });
      if (loadingTruck) operations.push({ ...op, truckId: loadingTruck.id, type: 'loading', appliedAt: hoursAfter(date, 3) });
    }
    orders.push({
      ...base,
      refNumber: `REF-${2000 + i * 10}`,
      type: 'cross_dock',
      subtype: random() < 0.6 ? 'storage' : 'pickup',
      truckId: truck.id,
      declaredQty,
      actualQty: status === 'new' ? null : actualQty,
      alert: hasAlert ? 'BOL missing' : null,
      nextAction: status === 'new' ? 'Waiting for truck' : status === 'in_progress' ? 'Loading' : null,
      operations: { create: operations },
      supplies: active ? undefined : { create: [{ sku: 'Straps 12', category: 'securement', qty: int(2, 6), unitPriceCents: 350 }] },
    });
  }

  for (const data of orders) {
    await prisma.order.create({ data });
  }

  const [total, subOrders] = await Promise.all([
    prisma.order.count({ where: { parentId: null } }),
    prisma.order.count({ where: { parentId: { not: null } } }),
  ]);
  console.log(`Seeded: 2 hubs, ${carriers.length} carriers, ${total} orders (+${subOrders} sub-orders)`);
}

function subOrder(number: string, refNumber: string, declaredQty: number, palletType: 'std' | 'xl', truckId: string) {
  return { number, refNumber, type: 'consolidation' as const, declaredQty, palletType, truckId };
}

function photos(orderNumber: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    kind: 'photo',
    name: `photo-${i + 1}.jpg`,
    key: `orders/${orderNumber}/photo-${i + 1}.jpg`,
  }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
