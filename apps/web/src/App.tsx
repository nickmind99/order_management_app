import { DashboardPage } from './dashboard/DashboardPage';
import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';
import { OrderDetailPage } from './order-detail/OrderDetailPage';
import { OrderListPage } from './orders/OrderListPage';
import { useRoute } from './router';

export function App() {
  const route = useRoute();

  return (
    <div className="shell">
      <Sidebar route={route} />
      <main className="main">
        <Topbar />
        <div className="content">
          {route.page === 'dashboard' && <DashboardPage />}
          {route.page === 'orders' && <OrderListPage key={route.tab + route.search} tab={route.tab} search={route.search} />}
          {route.page === 'order' && <OrderDetailPage key={route.number} number={route.number} />}
          {route.page === 'not-found' && <h1>Page not found</h1>}
        </div>
      </main>
    </div>
  );
}
