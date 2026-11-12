import { describe, expect, it } from 'vitest';
import { matchRoute } from './router';

describe('matchRoute', () => {
  it('opens the dashboard on the root path', () => {
    expect(matchRoute('/', '')).toEqual({ page: 'dashboard' });
  });

  it('opens the order list with the search from the query string', () => {
    expect(matchRoute('/orders', '')).toEqual({ page: 'orders', tab: 'all', search: '' });
    expect(matchRoute('/orders', '?search=REF-1002')).toEqual({ page: 'orders', tab: 'all', search: 'REF-1002' });
  });

  it('opens the order list on the tab from the query string', () => {
    expect(matchRoute('/orders', '?tab=alerts')).toEqual({ page: 'orders', tab: 'alerts', search: '' });
    expect(matchRoute('/orders', '?tab=unknown')).toEqual({ page: 'orders', tab: 'all', search: '' });
  });

  it('opens an order by its number', () => {
    expect(matchRoute('/orders/FR001383', '')).toEqual({ page: 'order', number: 'FR001383' });
  });

  it('shows not found for unknown paths', () => {
    expect(matchRoute('/settings', '')).toEqual({ page: 'not-found' });
    expect(matchRoute('/orders/FR001383/edit', '')).toEqual({ page: 'not-found' });
  });
});
