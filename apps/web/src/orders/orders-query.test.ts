import { describe, expect, it } from 'vitest';
import { ordersQuery, type OrderFilters } from './orders-query';

const defaults: OrderFilters = { tab: 'all', hubId: '', period: '', status: '', page: 1 };

describe('ordersQuery', () => {
  it('sends only the tab and pagination when no filters are set', () => {
    expect(ordersQuery(defaults, '')).toBe('/orders?tab=all&page=1&pageSize=12');
  });

  it('adds the selected filters and the search', () => {
    const query = ordersQuery({ tab: 'alerts', hubId: 'hub-1', period: 'week', status: 'new', page: 3 }, 'acme co');

    expect(query).toBe('/orders?tab=alerts&page=3&pageSize=12&hubId=hub-1&period=week&status=new&search=acme+co');
  });
});
