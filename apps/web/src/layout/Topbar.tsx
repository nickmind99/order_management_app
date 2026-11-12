import { useState, type FormEvent } from 'react';

export function Topbar({ onSearch }: { onSearch: (search: string) => void }) {
  const [text, setText] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch(text.trim());
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
