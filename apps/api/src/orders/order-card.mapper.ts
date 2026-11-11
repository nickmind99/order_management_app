import type { Prisma } from '@freitty/db';
import { orderTotalCents } from '../common/pricing';
import { OrderCardDto } from './dto/order-card.dto';
import { hasAlert, hasWarning } from './order-flags';

export const orderCardInclude = {
  hub: { select: { id: true, name: true } },
  carrier: { select: { name: true } },
  subOrders: {
    select: {
      number: true,
      refNumber: true,
      palletType: true,
      declaredQty: true,
      actualQty: true,
      alert: true,
      warning: true,
      truckId: true,
    },
    orderBy: { number: 'asc' },
  },
  operations: { select: { priceCents: true } },
  supplies: { select: { qty: true, unitPriceCents: true } },
} satisfies Prisma.OrderInclude;

type OrderCardRow = Prisma.OrderGetPayload<{ include: typeof orderCardInclude }>;

export function toOrderCard(order: OrderCardRow): OrderCardDto {
  const isConsolidation = order.type === 'consolidation';
  const cargo = isConsolidation && order.subOrders.length > 0 ? order.subOrders : [order];
  const sum = (pick: (c: (typeof cargo)[number]) => number) => cargo.reduce((total, c) => total + pick(c), 0);
  const counted = cargo.every((c) => c.actualQty !== null);

  return {
    number: order.number,
    refNumber: order.refNumber,
    type: order.type,
    subtype: order.subtype,
    status: order.status,
    alert: order.alert,
    warning: order.warning,
    hasAlert: hasAlert(order),
    hasWarning: hasWarning(order),
    nextAction: order.nextAction,
    createdBy: order.createdBy,
    hub: order.hub,
    date: order.date,
    destination: order.destination,
    pallets: {
      std: sum((c) => (c.palletType === 'std' ? c.declaredQty : 0)),
      xl: sum((c) => (c.palletType === 'xl' ? c.declaredQty : 0)),
    },
    declaredQty: sum((c) => c.declaredQty),
    actualQty: counted ? sum((c) => c.actualQty ?? 0) : null,
    carrier: order.carrier?.name ?? null,
    trailers: isConsolidation ? new Set(order.subOrders.map((s) => s.truckId).filter(Boolean)).size : null,
    invoiceNumber: order.invoiceNumber,
    totalCents: orderTotalCents(order),
    subOrders: order.subOrders.map(({ truckId: _truckId, ...sub }) => sub),
  };
}
