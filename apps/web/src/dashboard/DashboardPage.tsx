import { useState } from 'react';
import { generateOrder, useApi, type OrderList, type OrderStats } from '../api';
import { OrderCard } from '../components/OrderCard';
import { useShowError } from '../toast';
import { ActivityPanel } from './ActivityPanel';
import { StatsCards } from './StatsCards';

function GenerateButton({ onGenerated }: { onGenerated: () => void }) {
  const [busy, setBusy] = useState(false);
  const showError = useShowError();

  async function handleClick() {
    setBusy(true);
    try {
      await generateOrder();
      onGenerated();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="btn btn-primary" onClick={handleClick} disabled={busy}>
      {busy ? 'Generating…' : '✨ Generate order'}
    </button>
  );
}

export function DashboardPage({ search }: { search: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const stats = useApi<OrderStats>('/orders/stats', refreshKey);
  const ordersQuery = new URLSearchParams({ pageSize: '4', search });
  const orders = useApi<OrderList>(`/orders?${ordersQuery}`, refreshKey);
  const refresh = () => setRefreshKey((key) => key + 1);

  return (
    <>
      <div className="crumbs">
        Home <span>›</span> Dashboard
      </div>
      <div className="page-title">
        <h1>Dashboard</h1>
        <GenerateButton onGenerated={refresh} />
      </div>

      {stats.data && <StatsCards stats={stats.data} />}

      <div className="section-head">
        <h2>{search ? `Search results for “${search}”` : 'Active Orders'}</h2>
      </div>
      {orders.loading && <p className="muted">Loading…</p>}
      {orders.data?.items.length === 0 && <p className="muted">No orders found</p>}
      <div className="cards-grid">
        {orders.data?.items.map((order) => <OrderCard key={order.number} order={order} />)}
      </div>

      <ActivityPanel refreshKey={refreshKey} />
    </>
  );
}
