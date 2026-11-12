import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { ORDER_TABS, type OrderTab } from './orders/orders-query';

export type Route =
  | { page: 'dashboard' }
  | { page: 'orders'; tab: OrderTab; search: string }
  | { page: 'order'; number: string }
  | { page: 'not-found' };

export function matchRoute(pathname: string, search: string): Route {
  if (pathname === '/') return { page: 'dashboard' };
  if (pathname === '/orders') {
    const params = new URLSearchParams(search);
    const tab = ORDER_TABS.find((value) => value === params.get('tab')) ?? 'all';
    return { page: 'orders', tab, search: params.get('search') ?? '' };
  }
  const order = pathname.match(/^\/orders\/([^/]+)$/);
  if (order) return { page: 'order', number: decodeURIComponent(order[1]) };
  return { page: 'not-found' };
}

export function ordersUrl(tab: OrderTab, search = ''): string {
  const params = new URLSearchParams();
  if (tab !== 'all') params.set('tab', tab);
  if (search) params.set('search', search);
  return params.size ? `/orders?${params}` : '/orders';
}

export function navigate(url: string) {
  window.history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

export function useRoute(): Route {
  const [location, setLocation] = useState({ pathname: window.location.pathname, search: window.location.search });

  useEffect(() => {
    const update = () => setLocation({ pathname: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  return matchRoute(location.pathname, location.search);
}

export function Link({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  function handleClick(event: MouseEvent) {
    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
