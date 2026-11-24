import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { TaskApi } from '../data/task-api.service';
import { Task } from '../domain/task.model';
import { TaskStore } from './task.store';

const pendingTask: Task = { id: 1, title: 'A', status: 'pending' };

function setup(overrides: Partial<Record<keyof TaskApi, unknown>> = {}) {
  const api = {
    list: vi.fn(() => of([pendingTask])),
    create: vi.fn(() => of({})),
    updateStatus: vi.fn(() => of({})),
    remove: vi.fn(() => of(null)),
    ...overrides,
  };
  TestBed.configureTestingModule({
    providers: [TaskStore, { provide: TaskApi, useValue: api }],
  });
  return { api, store: TestBed.inject(TaskStore) };
}

describe('TaskStore', () => {
  it('loads tasks and clears the loading flag', async () => {
    const { store } = setup();
    await store.load();
    expect(store.tasks()).toEqual([pendingTask]);
    expect(store.loading()).toBe(false);
    expect(store.isEmpty()).toBe(false);
  });

  it('reports an empty list', async () => {
    const { store } = setup({ list: vi.fn(() => of([])) });
    await store.load();
    expect(store.isEmpty()).toBe(true);
  });

  it('exposes a safe message when loading fails', async () => {
    const { store } = setup({
      list: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 500 }))),
    });
    await store.load();
    expect(store.error()).toContain('failed to process');
    expect(store.loading()).toBe(false);
    expect(store.isEmpty()).toBe(false);
  });

  it('ignores a stale response that resolves after a newer load', async () => {
    const first = new Subject<Task[]>();
    const second = new Subject<Task[]>();
    const list = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const { store } = setup({ list });
    const firstLoad = store.load();
    const secondLoad = store.load();
    second.next([{ ...pendingTask, title: 'fresh' }]);
    second.complete();
    await secondLoad;
    first.next([{ ...pendingTask, title: 'stale' }]);
    first.complete();
    await firstLoad;
    expect(store.tasks()[0].title).toBe('fresh');
  });

  it('creates a trimmed task and reloads', async () => {
    const { api, store } = setup();
    await expect(store.add('  New  ')).resolves.toBe(true);
    expect(api.create).toHaveBeenCalledWith({ title: 'New', status: 'pending' });
    expect(api.list).toHaveBeenCalledTimes(1);
  });

  it('rejects a blank title without calling the API', async () => {
    const { api, store } = setup();
    await expect(store.add('   ')).resolves.toBe(false);
    expect(api.create).not.toHaveBeenCalled();
    expect(store.error()).toContain('between 1 and 200');
  });

  it('advances the status', async () => {
    const { api, store } = setup();
    await store.advanceStatus({ ...pendingTask, status: 'in_progress' });
    expect(api.updateStatus).toHaveBeenCalledWith(1, 'completed');
  });

  it('removes a task', async () => {
    const { api, store } = setup();
    await store.remove(1);
    expect(api.remove).toHaveBeenCalledWith(1);
  });

  it('blocks concurrent mutations', async () => {
    const pending = new Subject<unknown>();
    const { api, store } = setup({ create: vi.fn(() => pending) });
    const first = store.add('One');
    await expect(store.add('Two')).resolves.toBe(false);
    expect(api.create).toHaveBeenCalledTimes(1);
    pending.next({});
    pending.complete();
    await expect(first).resolves.toBe(true);
    expect(store.saving()).toBe(false);
  });

  it('surfaces a failed mutation and skips the reload', async () => {
    const { api, store } = setup({
      remove: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 404 }))),
    });
    await expect(store.remove(1)).resolves.toBe(false);
    expect(store.error()).toContain('no longer exists');
    expect(store.saving()).toBe(false);
    expect(api.list).not.toHaveBeenCalled();
  });
});
