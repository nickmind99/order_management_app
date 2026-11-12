import { describe, expect, it } from 'vitest';
import type { Activity, ActivityPeriod } from '../api';
import { buildCharts } from './chart-data';

function activity(period: ActivityPeriod, from: string, to: string, orders: [string, number][]): Activity {
  return {
    period,
    from,
    to,
    chartFrom: from,
    completed: orders.length,
    spendCents: 0,
    avgPerOrderCents: 0,
    previousCompleted: 0,
    completedChangePct: null,
    orders: orders.map(([completedAt, totalCents], i) => ({ number: `FR${i}`, completedAt, totalCents })),
  };
}

describe('buildCharts', () => {
  it('splits a month into days and sums orders and spend per day', () => {
    const { completed, spend, lastIndex } = buildCharts(
      activity('month', '2026-11-01T00:00:00Z', '2026-11-12T15:00:00Z', [
        ['2026-11-03T09:00:00Z', 10000],
        ['2026-11-03T18:00:00Z', 5050],
        ['2026-11-06T12:00:00Z', 24800],
      ]),
    );

    expect(completed).toHaveLength(30);
    expect(completed[0].label).toBe('1');
    expect(completed[29].label).toBe('30');
    expect(completed[2].value).toBe(2);
    expect(spend[2].value).toBe(151);
    expect(completed[5].value).toBe(1);
    expect(spend[5].value).toBe(248);
    expect(lastIndex).toBe(11);
  });

  it('uses the real number of days in the month', () => {
    const { completed } = buildCharts(activity('month', '2026-02-01T00:00:00Z', '2026-02-10T00:00:00Z', []));

    expect(completed).toHaveLength(28);
  });

  it('splits a week into weekdays starting on Monday', () => {
    const { completed, lastIndex } = buildCharts(
      activity('week', '2026-11-09T00:00:00Z', '2026-11-12T15:00:00Z', [['2026-11-11T10:00:00Z', 1000]]),
    );

    expect(completed.map((bar) => bar.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(completed[2].value).toBe(1);
    expect(lastIndex).toBe(3);
  });

  it('splits a day into hours', () => {
    const { completed, lastIndex } = buildCharts(
      activity('day', '2026-11-12T00:00:00Z', '2026-11-12T15:00:00Z', [['2026-11-12T14:30:00Z', 1000]]),
    );

    expect(completed).toHaveLength(24);
    expect(completed[14].value).toBe(1);
    expect(lastIndex).toBe(15);
  });

  it('splits the year into quarters for the quarter period', () => {
    const { completed, spend, lastIndex } = buildCharts(
      activity('quarter', '2026-10-01T00:00:00Z', '2026-11-12T15:00:00Z', [
        ['2026-02-10T12:00:00Z', 5000],
        ['2026-09-30T23:00:00Z', 7000],
        ['2026-11-10T12:00:00Z', 9000],
      ]),
    );

    expect(completed.map((bar) => bar.label)).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    expect(completed.map((bar) => bar.value)).toEqual([1, 0, 1, 1]);
    expect(spend[3].value).toBe(90);
    expect(lastIndex).toBe(3);
  });
});
