import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TaskApi } from './task-api.service';

describe('TaskApi', () => {
  let api: TaskApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(TaskApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists valid tasks', async () => {
    const result = firstValueFrom(api.list());
    http.expectOne('/api/tasks').flush([{ id: 1, title: 'A', status: 'pending' }]);
    await expect(result).resolves.toEqual([{ id: 1, title: 'A', status: 'pending' }]);
  });

  it.each([[{ tasks: [] }], [[{ id: 1, title: 'A', status: 'unknown' }]]])(
    'rejects malformed list payload %#',
    async (payload) => {
      const result = firstValueFrom(api.list());
      http.expectOne('/api/tasks').flush(payload);
      await expect(result).rejects.toThrow('Malformed task list response');
    },
  );

  it('creates a task', () => {
    api.create({ title: 'A', status: 'pending' }).subscribe();
    const request = http.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ title: 'A', status: 'pending' });
    request.flush({});
  });

  it('updates only the status', () => {
    api.updateStatus(7, 'completed').subscribe();
    const request = http.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ status: 'completed' });
    request.flush({});
  });

  it('deletes a task', () => {
    api.remove(7).subscribe();
    const request = http.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it.each([0, -1, 1.5])('refuses to address invalid id %d', async (id) => {
    await expect(firstValueFrom(api.remove(id))).rejects.toThrow('Invalid task id');
    await expect(firstValueFrom(api.updateStatus(id, 'pending'))).rejects.toThrow(
      'Invalid task id',
    );
    http.expectNone(() => true);
  });
});
