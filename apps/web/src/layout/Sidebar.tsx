export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        FREITT<span>Y</span>
      </div>
      <nav>
        <a className="nav-item active" href="/">
          📦 Orders
        </a>
        <a className="nav-item" href="/">
          ⚙️ Settings
        </a>
      </nav>
    </aside>
  );
}
