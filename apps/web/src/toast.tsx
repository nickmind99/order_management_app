import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
}

const TOAST_LIFETIME_MS = 5000;

const ToastContext = createContext<(message: string) => void>(() => undefined);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const close = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback(
    (message: string) => {
      const id = ++nextId;
      setToasts((list) => (list.some((toast) => toast.message === message) ? list : [...list, { id, message }]));
      setTimeout(() => close(id), TOAST_LIFETIME_MS);
    },
    [close],
  );

  return (
    <ToastContext value={showError}>
      {children}
      <div className="toasts">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span>⚠ {toast.message}</span>
            <button className="toast-close" onClick={() => close(toast.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useShowError() {
  return useContext(ToastContext);
}
