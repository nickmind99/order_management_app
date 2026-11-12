import type { Activity } from '../api';
import type { Bar } from './BarChart';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function periodBuckets(activity: Activity): string[] {
  const from = new Date(activity.from);
  const year = from.getUTCFullYear();
  const month = from.getUTCMonth();

  if (activity.period === 'day') return Array.from({ length: 24 }, (_, hour) => `${hour}`);
  if (activity.period === 'week') return WEEKDAYS;
  if (activity.period === 'month') {
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return Array.from({ length: days }, (_, day) => `${day + 1}`);
  }
  return ['Q1', 'Q2', 'Q3', 'Q4'];
}

function bucketIndex(activity: Activity, date: string): number {
  if (activity.period === 'quarter') return Math.floor(new Date(date).getUTCMonth() / 3);
  const elapsed = new Date(date).getTime() - new Date(activity.from).getTime();
  if (activity.period === 'day') return Math.floor(elapsed / HOUR_MS);
  return Math.floor(elapsed / DAY_MS);
}

export function buildCharts(activity: Activity) {
  const labels = periodBuckets(activity);
  const completed: Bar[] = labels.map((label) => ({ label, value: 0 }));
  const spend: Bar[] = labels.map((label) => ({ label, value: 0 }));

  for (const order of activity.orders) {
    const i = bucketIndex(activity, order.completedAt);
    completed[i].value += 1;
    spend[i].value += Math.round(order.totalCents / 100);
  }
  const lastIndex = Math.min(labels.length - 1, bucketIndex(activity, activity.to));
  return { completed, spend, lastIndex };
}
