import { useState } from 'react';
import { useApi, type Activity, type ActivityPeriod } from '../api';
import { formatMoney } from '../format';
import { BarChart, type Bar } from './BarChart';
import { buildCharts } from './chart-data';
import { LineChart } from './LineChart';

const PERIODS = [
  { value: 'day', label: 'Day', caption: 'today', bucket: 'hour' },
  { value: 'week', label: 'CW', caption: 'this week', bucket: 'day' },
  { value: 'month', label: 'Month', caption: 'this month', bucket: 'day' },
  { value: 'quarter', label: 'Quarter', caption: 'this quarter', bucket: 'quarter' },
] as const;

function Summary({ activity, spend, bucket }: { activity: Activity; spend: Bar[]; bucket: string }) {
  const change = activity.completedChangePct;
  const best = spend.reduce((top, bar) => (bar.value > top.value ? bar : top), spend[0]);

  return (
    <div className="activity-summary">
      {change !== null && (
        <span>
          📈 <strong className={change < 0 ? 'text-alert' : 'text-success'}>{change > 0 ? `+${change}` : change}%</strong> completed orders vs previous
          period
        </span>
      )}
      <span>
        💰 <strong className="text-brand">{formatMoney(activity.spendCents)}</strong> spent · avg{' '}
        {formatMoney(activity.avgPerOrderCents)}/order
      </span>
      {best.value > 0 && (
        <span>
          ⭐ Best {bucket}: {best.label} (peak spend ${best.value})
        </span>
      )}
    </div>
  );
}

export function ActivityPanel({ refreshKey }: { refreshKey: number }) {
  const [period, setPeriod] = useState<ActivityPeriod>('month');
  const { data: activity, loading } = useApi<Activity>(`/orders/activity?period=${period}`, refreshKey);
  const current = PERIODS.find((p) => p.value === period) ?? PERIODS[2];

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>📊 Your activity</h2>
        <div className="period-buttons">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={p.value === period ? 'period active' : 'period'}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {activity && <ActivityCharts activity={activity} caption={current.caption} bucket={current.bucket} />}
    </section>
  );
}

function ActivityCharts({ activity, caption, bucket }: { activity: Activity; caption: string; bucket: string }) {
  const { completed, spend, lastIndex } = buildCharts(activity);

  return (
    <>
      <div className="charts">
        <div>
          <div className="chart-head">
            <span className="chart-title">Completed orders</span>
            <span className="chart-total text-success">
              {activity.completed} <small>{caption}</small>
            </span>
          </div>
          <BarChart bars={completed} color="#16A34A" />
        </div>
        <div>
          <div className="chart-head">
            <span className="chart-title">Spend</span>
            <span className="chart-total text-brand">
              {formatMoney(activity.spendCents)} <small>{caption}</small>
            </span>
          </div>
          <LineChart points={spend} lastIndex={lastIndex} color="#ED1C2E" />
        </div>
      </div>
      <Summary activity={activity} spend={spend} bucket={bucket} />
    </>
  );
}
