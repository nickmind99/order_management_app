import { useState } from 'react';
import { useApi, type Hub, type OrderList } from '../api';
import { OrderCard } from '../components/OrderCard';
import { STATUS_LABELS } from '../format';
import { Link, navigate, ordersUrl } from '../router';
import { ordersQuery, PAGE_SIZE, type OrderFilters, type OrderTab } from './orders-query';

const TABS: { value: OrderTab; label: string; count: keyof OrderList['tabs'] }[] = [
  { value: 'all', label: 'All', count: 'all' },
  { value: 'cross_dock', label: 'Cross-Dock', count: 'crossDock' },
  { value: 'consolidation', label: 'Consolidation', count: 'consolidation' },
  { value: 'alerts', label: 'Alerts', count: 'alerts' },
  { value: 'drafts', label: 'Drafts', count: 'drafts' },
];

const PERIODS = [
  { value: '', label: 'Date: Any' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

type Filters = Omit<OrderFilters, 'tab'>;

export function OrderListPage({ tab, search }: { tab: OrderTab; search: string }) {
  const [filters, setFilters] = useState<Filters>({ hubId: '', period: '', status: '', page: 1 });
  const hubs = useApi<Hub[]>('/hubs');
  const orders = useApi<OrderList>(ordersQuery({ ...filters, tab }, search));

  const change = (update: Partial<Filters>) => setFilters((current) => ({ ...current, page: 1, ...update }));
  const pages = Math.max(1, Math.ceil((orders.data?.total ?? 0) / PAGE_SIZE));

  return (
    <>
      <div className="crumbs">
        <Link to="/">Home</Link> <span>›</span> Orders
      </div>
      <div className="page-title">
        <h1>{search ? `Search results for “${search}”` : 'All Orders'}</h1>
      </div>

      <div className="tabs">
        {TABS.map((item) => (
          <button
            key={item.value}
            className={item.value === tab ? 'tab active' : 'tab'}
            onClick={() => navigate(ordersUrl(item.value, search))}
          >
            {item.label} <span className="tab-count">{orders.data?.tabs[item.count] ?? '…'}</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={filters.hubId} onChange={(event) => change({ hubId: event.target.value })}>
          <option value="">Hub: All</option>
          {hubs.data?.map((hub) => (
            <option key={hub.id} value={hub.id}>
              {hub.name}
            </option>
          ))}
        </select>
        <select value={filters.period} onChange={(event) => change({ period: event.target.value })}>
          {PERIODS.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={(event) => change({ status: event.target.value })}>
          <option value="">Status: Any</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {orders.loading && <p className="muted">Loading…</p>}
      {orders.data?.items.length === 0 && <p className="muted">No orders found</p>}
      <div className="cards-grid">
        {orders.data?.items.map((order) => <OrderCard key={order.number} order={order} />)}
      </div>

      {orders.data && orders.data.total > 0 && (
        <div className="pagination">
          <span className="muted">
            Showing {orders.data.items.length} of {orders.data.total}
          </span>
          <div className="pagination-buttons">
            <button className="btn btn-secondary" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
              ← Prev
            </button>
            <span className="muted">
              {filters.page} / {pages}
            </span>
            <button className="btn btn-secondary" disabled={filters.page >= pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
