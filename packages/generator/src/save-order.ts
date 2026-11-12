import { PrismaClient } from '@freitty/db';
import { GeneratedOrder, GeneratorContext } from './types';

function normalize(order: GeneratedOrder, context: GeneratorContext): GeneratedOrder {
  const hub = context.hubs.find((h) => h.id === order.hubId);
  const carrier = context.carriers.find((c) => c.id === order.carrierId);
  const truckIds = new Set(carrier?.trucks.map((t) => t.id) ?? []);
  const ownTruck = (truckId: string | null) => (truckId && truckIds.has(truckId) ? truckId : null);

  const isConsolidation = order.type === 'consolidation' && order.subOrders.length > 0;
  const subOrders = isConsolidation
    ? order.subOrders.map((sub) => ({ ...sub, declaredQty: Math.max(1, sub.declaredQty), truckId: ownTruck(sub.truckId) }))
    : [];

  return {
    ...order,
    type: isConsolidation ? 'consolidation' : 'cross_dock',
    subtype: isConsolidation ? null : (order.subtype ?? 'storage'),
    refNumber: order.status === 'draft' ? null : order.refNumber,
    dockId: hub?.docks.some((d) => d.id === order.dockId) ? order.dockId : null,
    carrierId: carrier ? carrier.id : null,
    truckId: isConsolidation ? null : ownTruck(order.truckId),
    declaredQty: isConsolidation ? subOrders.reduce((sum, sub) => sum + sub.declaredQty, 0) : Math.max(1, order.declaredQty),
    date: Number.isNaN(Date.parse(order.date)) ? context.today : order.date,
    subOrders,
  };
}

export async function saveOrder(prisma: PrismaClient, generated: GeneratedOrder, context: GeneratorContext): Promise<string> {
  const { subOrders, ...data } = normalize(generated, context);
  const date = new Date(data.date);

  return prisma.$transaction(async (tx) => {
    const parent = await tx.order.create({
      data: { ...data, date, statusHistory: [{ status: data.status, at: new Date(), by: data.createdBy }] },
    });
    await tx.order.createMany({
      data: subOrders.map((sub, i) => ({
        ...sub,
        number: `${parent.number}-${i + 1}`,
        parentId: parent.id,
        type: parent.type,
        status: parent.status,
        hubId: parent.hubId,
        date,
        customer: parent.customer,
        carrierId: parent.carrierId,
        createdBy: parent.createdBy,
      })),
    });
    return parent.number;
  });
}
