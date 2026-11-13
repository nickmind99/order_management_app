import { PrismaClient } from '@freitty/db';
import { GeneratedOrder, GeneratorContext } from './types';

const STEP_MS = 20 * 60_000;

function normalize(order: GeneratedOrder, context: GeneratorContext): GeneratedOrder {
  const hub = context.hubs.find((h) => h.id === order.hubId);
  const carrier = context.carriers.find((c) => c.id === order.carrierId);
  const truckIds = new Set(carrier?.trucks.map((t) => t.id) ?? []);
  const ownTruck = (truckId: string | null) => (truckId && truckIds.has(truckId) ? truckId : null);
  const isCompleted = order.status === 'completed';
  const date = Date.parse(order.date);
  const isFuture = date > Date.parse(context.today);

  const isConsolidation = order.type === 'consolidation' && order.subOrders.length > 0;
  const subOrders = isConsolidation
    ? order.subOrders.map((sub) => ({ ...sub, declaredQty: Math.max(1, sub.declaredQty), truckId: ownTruck(sub.truckId) }))
    : [];

  return {
    ...order,
    nextAction: isCompleted ? null : order.nextAction,
    operations: isCompleted ? order.operations.map((op) => ({ ...op, qty: Math.max(1, op.qty) })) : [],
    supplies: isCompleted ? order.supplies.map((supply) => ({ ...supply, qty: Math.max(1, supply.qty) })) : [],
    type: isConsolidation ? 'consolidation' : 'cross_dock',
    subtype: isConsolidation ? null : (order.subtype ?? 'storage'),
    dockId: hub?.docks.some((d) => d.id === order.dockId) ? order.dockId : null,
    carrierId: carrier ? carrier.id : null,
    truckId: isConsolidation ? null : ownTruck(order.truckId),
    declaredQty: isConsolidation ? subOrders.reduce((sum, sub) => sum + sub.declaredQty, 0) : Math.max(1, order.declaredQty),
    date: Number.isNaN(date) || (isCompleted && isFuture) ? context.today : order.date,
    subOrders,
  };
}

export async function saveOrder(prisma: PrismaClient, generated: GeneratedOrder, context: GeneratorContext): Promise<string> {
  const { subOrders, operations, supplies, ...data } = normalize(generated, context);
  const date = new Date(data.date);
  const now = new Date(context.today);
  const isCompleted = data.status === 'completed';
  const completedAt = isCompleted ? now : null;
  const statusHistory = isCompleted
    ? [
        { status: 'new', at: new Date(now.getTime() - (operations.length + 1) * STEP_MS), by: data.createdBy },
        { status: 'completed', at: now, by: data.createdBy },
      ]
    : [{ status: 'new', at: now, by: data.createdBy }];

  return prisma.$transaction(async (tx) => {
    const parent = await tx.order.create({
      data: { ...data, date, statusHistory, completedAt, actualQty: isCompleted ? data.declaredQty : null },
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
        completedAt,
        actualQty: isCompleted ? sub.declaredQty : null,
      })),
    });
    await tx.operation.createMany({
      data: operations.map((op, i) => ({
        ...op,
        orderId: parent.id,
        palletType: parent.palletType,
        truckId: op.type === 'unloading' || op.type === 'loading' ? parent.truckId : null,
        appliedAt: new Date(now.getTime() - (operations.length - i) * STEP_MS),
      })),
    });
    await tx.supply.createMany({ data: supplies.map((supply) => ({ ...supply, orderId: parent.id })) });
    return parent.number;
  });
}
