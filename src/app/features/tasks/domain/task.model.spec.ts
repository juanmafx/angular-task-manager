import {
  TASK_TITLE_MAX_LENGTH,
  isTask,
  isTaskId,
  nextStatus,
  normalizeTitle,
  statusLabel,
} from './task.model';

describe('task model', () => {
  it('cycles through every status', () => {
    expect(nextStatus('pending')).toBe('in_progress');
    expect(nextStatus('in_progress')).toBe('completed');
    expect(nextStatus('completed')).toBe('pending');
  });

  it('provides readable labels', () => {
    expect(statusLabel('in_progress')).toBe('In progress');
  });

  it('trims titles', () => {
    expect(normalizeTitle('  Write tests  ')).toBe('Write tests');
  });

  it('accepts a title at the maximum length', () => {
    const title = 'a'.repeat(TASK_TITLE_MAX_LENGTH);
    expect(normalizeTitle(title)).toBe(title);
  });

  it.each(['', '   ', 'a'.repeat(TASK_TITLE_MAX_LENGTH + 1)])(
    'rejects invalid title %#',
    (title) => {
      expect(normalizeTitle(title)).toBeNull();
    },
  );

  it.each([0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1, '1', null])(
    'rejects invalid id %j',
    (id) => {
      expect(isTaskId(id)).toBe(false);
    },
  );

  it('accepts a well-formed task', () => {
    expect(isTask({ id: 1, title: 'A', status: 'pending' })).toBe(true);
  });

  it.each(['Details', '', null])('accepts description %j', (description) => {
    expect(isTask({ id: 1, title: 'A', status: 'pending', description })).toBe(true);
  });

  it.each([
    null,
    'task',
    { id: '1', title: 'A', status: 'pending' },
    { id: 1, title: 2, status: 'pending' },
    { id: 1, title: 'A', status: 'archived' },
    { id: 1, title: 'A', status: 'pending', description: 5 },
    { id: 1, title: 'A', status: 'pending', description: {} },
  ])('rejects malformed task %#', (value) => {
    expect(isTask(value)).toBe(false);
  });
});
