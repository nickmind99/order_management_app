import type { OrderCard, OrderStatus, OrderSubtype, OrderType } from './api';

export const TYPE_LABELS: Record<OrderType, string> = { cross_dock: 'Cross-Dock', consolidation: 'Consolidation' };
export const SUBTYPE_LABELS: Record<OrderSubtype, string> = { storage: 'Storage', pickup: 'Pickup' };
export const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  new: 'New',
  in_progress: 'In progress',
  completed: 'Completed',
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatPallets({ pallets }: OrderCard): string {
  if (pallets.std && pallets.xl) return `${pallets.std} × Std + ${pallets.xl} × XL`;
  if (pallets.xl) return `${pallets.xl} × XL`;
  return `${pallets.std} × Standard`;
}
