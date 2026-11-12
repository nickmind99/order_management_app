import { useState } from 'react';
import { DashboardPage } from './dashboard/DashboardPage';
import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';

export function App() {
  const [search, setSearch] = useState('');

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <Topbar onSearch={setSearch} />
        <div className="content">
          <DashboardPage search={search} />
        </div>
      </main>
    </div>
  );
}
