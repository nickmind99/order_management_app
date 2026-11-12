import type { OrderStatus } from '../api';

const FLOW: OrderStatus[] = ['draft', 'new', 'in_progress', 'completed'];

export type StepState = 'done' | 'current' | 'todo';

export function statusSteps(status: OrderStatus): { status: OrderStatus; state: StepState }[] {
  const current = FLOW.indexOf(status);
  return FLOW.map((step, i) => ({ status: step, state: i < current ? 'done' : i === current ? 'current' : 'todo' }));
}
