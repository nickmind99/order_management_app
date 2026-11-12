import { describe, expect, it } from 'vitest';
import { statusSteps } from './status-steps';

describe('statusSteps', () => {
  it('marks previous steps as done and the current one as current', () => {
    expect(statusSteps('in_progress').map((step) => step.state)).toEqual(['done', 'done', 'current', 'todo']);
  });

  it('starts from draft and ends with completed', () => {
    expect(statusSteps('draft').map((step) => step.state)).toEqual(['current', 'todo', 'todo', 'todo']);
    expect(statusSteps('completed').map((step) => step.status)).toEqual(['draft', 'new', 'in_progress', 'completed']);
  });
});
