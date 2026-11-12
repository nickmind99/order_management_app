export const ORDER_TABS = ['all', 'cross_dock', 'consolidation', 'alerts', 'drafts'] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

export interface OrderFilters {
  tab: OrderTab;
  hubId: string;
  period: string;
  status: string;
  page: number;
}

export const PAGE_SIZE = 12;

export function ordersQuery(filters: OrderFilters, search: string): string {
  const params = new URLSearchParams({ tab: filters.tab, page: String(filters.page), pageSize: String(PAGE_SIZE) });
  if (filters.hubId) params.set('hubId', filters.hubId);
  if (filters.period) params.set('period', filters.period);
  if (filters.status) params.set('status', filters.status);
  if (search) params.set('search', search);
  return `/orders?${params}`;
}
