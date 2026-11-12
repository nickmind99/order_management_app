import { describe, expect, it } from 'vitest';
import { hasAlert, hasWarning } from './order-flags';

const clean = { alert: null, warning: null };

describe('order flags', () => {
  it('is clean when neither the order nor sub-orders have flags', () => {
    const order = { ...clean, subOrders: [clean, clean] };
    expect(hasAlert(order)).toBe(false);
    expect(hasWarning(order)).toBe(false);
  });

  it('takes flags from the order itself', () => {
    const order = { alert: 'Damaged pallet', warning: 'Awaiting BOL', subOrders: [] };
    expect(hasAlert(order)).toBe(true);
    expect(hasWarning(order)).toBe(true);
  });

  it('takes flags from any sub-order', () => {
    expect(hasAlert({ ...clean, subOrders: [clean, { alert: 'Short count', warning: null }] })).toBe(true);
    expect(hasWarning({ ...clean, subOrders: [{ alert: null, warning: 'Late truck' }] })).toBe(true);
  });

  it('keeps alert and warning independent', () => {
    const order = { alert: null, warning: 'Awaiting BOL', subOrders: [] };
    expect(hasAlert(order)).toBe(false);
    expect(hasWarning(order)).toBe(true);
  });
});
