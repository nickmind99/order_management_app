import { API_URL } from '../api';
import { Link, type Route } from '../router';

export function Sidebar({ route }: { route: Route }) {
  const itemClass = (active: boolean) => (active ? 'nav-item active' : 'nav-item');

  return (
    <aside className="sidebar">
      <Link to="/" className="logo">
        FREITT<span>Y</span>
      </Link>
      <nav>
        <Link to="/" className={itemClass(route.page === 'dashboard')}>
          📊 Dashboard
        </Link>
        <Link to="/orders" className={itemClass(route.page === 'orders' || route.page === 'order')}>
          📦 Orders
        </Link>
        <a className="nav-item" href={`${API_URL}/docs`} target="_blank" rel="noreferrer">
          📘 API docs ↗
        </a>
      </nav>
    </aside>
  );
}
