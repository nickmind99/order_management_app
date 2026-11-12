import type { OrderStats } from '../api';

function completedTrend(current: number, previous: number): string {
  if (current > previous) return `▲ ${current - previous} vs previous 30 d`;
  if (current < previous) return `▼ ${previous - current} vs previous 30 d`;
  return '⟶ same as previous 30 d';
}

export function StatsCards({ stats }: { stats: OrderStats }) {
  const { needAttention } = stats;

  return (
    <div className="kpi-grid">
      <div className="kpi kpi-blue">
        <div className="kpi-label">Active Orders</div>
        <div className="kpi-value">{stats.activeOrders}</div>
        <div className="kpi-trend text-success">▲ {stats.activeThisWeek} this week</div>
      </div>

      <div className="kpi kpi-green">
        <div className="kpi-label">Completed (30 d)</div>
        <div className="kpi-value">{stats.completed30d}</div>
        <div className="kpi-trend muted">{completedTrend(stats.completed30d, stats.completedPrev30d)}</div>
      </div>

      <div className="kpi kpi-red kpi-attention">
        <div className="kpi-label">⚠ Need Attention</div>
        <div className="attention-row">
          <div>
            <div className="kpi-value">{needAttention.total}</div>
            <div className="attention-total">Total</div>
          </div>
          <span className="chip chip-orange">{needAttention.awaitingAction} · awaiting your action</span>
          <span className="chip chip-red">{needAttention.alerts} · alert</span>
        </div>
      </div>
    </div>
  );
}
