import { useState } from 'react';
import { generateOrder, useApi, type OrderList, type OrderStats } from '../api';
import { OrderCard } from '../components/OrderCard';
import { Link } from '../router';
import { useShowError } from '../toast';
import { ActivityPanel } from './ActivityPanel';
import { StatsCards } from './StatsCards';

function GenerateButton({ onGenerated }: { onGenerated: (number: string) => void }) {
  const [busy, setBusy] = useState(false);
  const showError = useShowError();

  async function handleClick() {
    setBusy(true);
    try {
      const order = await generateOrder();
      onGenerated(order.number);
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

export function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [newNumber, setNewNumber] = useState<string | null>(null);
  const stats = useApi<OrderStats>('/orders/stats', refreshKey);
  const orders = useApi<OrderList>('/orders?pageSize=4', refreshKey);
  function handleGenerated(number: string) {
    setNewNumber(number);
    setRefreshKey((key) => key + 1);
  }

  return (
    <>
      <div className="crumbs">
        Home <span>›</span> Dashboard
      </div>
      <div className="page-title">
        <h1>Dashboard</h1>
        <GenerateButton onGenerated={handleGenerated} />
      </div>

      {stats.data && <StatsCards stats={stats.data} />}

      <div className="section-head">
        <h2>Active Orders</h2>
        <Link to="/orders" className="link">
          View all →
        </Link>
      </div>
      {orders.loading && <p className="muted">Loading…</p>}
      <div className="cards-grid">
        {orders.data?.items.map((order) => (
          <OrderCard key={order.number} order={order} isNew={order.number === newNumber} />
        ))}
      </div>

      <ActivityPanel refreshKey={refreshKey} />
    </>
  );
}
