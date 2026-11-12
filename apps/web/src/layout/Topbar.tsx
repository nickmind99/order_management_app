import { useState, type FormEvent } from 'react';
import { navigate } from '../router';

export function Topbar() {
  const [text, setText] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const search = text.trim();
    navigate(search ? `/orders?${new URLSearchParams({ search })}` : '/orders');
  }

  return (
    <header className="topbar">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search"
          placeholder="🔍 Search orders, invoices, documents…"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </form>
    </header>
  );
}
