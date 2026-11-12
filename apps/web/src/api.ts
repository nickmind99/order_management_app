import { useEffect, useState } from 'react';
import { useShowError } from './toast';

export type OrderType = 'cross_dock' | 'consolidation';
export type OrderSubtype = 'storage' | 'pickup';
export type OrderStatus = 'draft' | 'new' | 'in_progress' | 'completed';
export type PalletType = 'std' | 'xl';
export type ActivityPeriod = 'day' | 'week' | 'month' | 'quarter';

export interface SubOrderCard {
  number: string;
  refNumber: string | null;
  palletType: PalletType;
  declaredQty: number;
  actualQty: number | null;
  alert: string | null;
  warning: string | null;
}

export interface OrderCard {
  number: string;
  refNumber: string | null;
  type: OrderType;
  subtype: OrderSubtype | null;
  status: OrderStatus;
  alert: string | null;
  warning: string | null;
  hasAlert: boolean;
  hasWarning: boolean;
  nextAction: string | null;
  createdBy: string;
  hub: { id: string; name: string };
  date: string;
  destination: string | null;
  pallets: { std: number; xl: number };
  declaredQty: number;
  actualQty: number | null;
  carrier: string | null;
  trailers: number | null;
  invoiceNumber: string | null;
  totalCents: number;
  subOrders: SubOrderCard[];
}

export interface OrderList {
  items: OrderCard[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderStats {
  activeOrders: number;
  activeThisWeek: number;
  completed30d: number;
  completedPrev30d: number;
  needAttention: { total: number; awaitingAction: number; alerts: number };
}

export interface Activity {
  period: ActivityPeriod;
  from: string;
  to: string;
  chartFrom: string;
  completed: number;
  spendCents: number;
  avgPerOrderCents: number;
  previousCompleted: number;
  completedChangePct: number | null;
  orders: { number: string; completedAt: string; totalCents: number }[];
}

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, method = 'GET'): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { method }).catch(() => {
    throw new Error('Server is not available, try again later');
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    const fallback = response.status >= 500 ? 'Server is not available, try again later' : 'Something went wrong';
    throw new Error(body.message ?? fallback);
  }
  return response.json() as Promise<T>;
}

export function generateOrder(): Promise<{ number: string }> {
  return request('/orders/generate', 'POST');
}

export function useApi<T>(path: string, refreshKey = 0) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);
  const showError = useShowError();

  useEffect(() => {
    let active = true;
    request<T>(path)
      .then((result) => {
        if (!active) return;
        setData(result);
        setFailed(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setFailed(true);
        showError(err.message);
      });
    return () => {
      active = false;
    };
  }, [path, refreshKey, showError]);

  return { data, loading: !data && !failed };
}
