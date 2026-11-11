import type { Prisma } from '@freitty/db';

export const withAlert: Prisma.OrderWhereInput = {
  OR: [{ alert: { not: null } }, { subOrders: { some: { alert: { not: null } } } }],
};

export const withWarning: Prisma.OrderWhereInput = {
  OR: [{ warning: { not: null } }, { subOrders: { some: { warning: { not: null } } } }],
};

type Flagged = { alert: string | null; warning: string | null; subOrders: { alert: string | null; warning: string | null }[] };

export function hasAlert(order: Flagged): boolean {
  return order.alert !== null || order.subOrders.some((s) => s.alert !== null);
}

export function hasWarning(order: Flagged): boolean {
  return order.warning !== null || order.subOrders.some((s) => s.warning !== null);
}
