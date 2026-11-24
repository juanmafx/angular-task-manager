import { Injectable, inject } from '@angular/core';
import { Observable, defer, map } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';
import { NewTask, Task, TaskStatus, isTask, isTaskId } from '../domain/task.model';

const TASKS_ENDPOINT = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly api = inject(ApiClient);

  list(): Observable<Task[]> {
    return this.api.get<unknown>(TASKS_ENDPOINT).pipe(
      map((payload) => {
        if (!Array.isArray(payload) || !payload.every(isTask)) {
          throw new Error('Malformed task list response');
        }
        return payload;
      }),
    );
  }

  create(task: NewTask): Observable<unknown> {
    return this.api.post<unknown>(TASKS_ENDPOINT, task);
  }

  updateStatus(id: number, status: TaskStatus): Observable<unknown> {
    return defer(() => this.api.put<unknown>(this.taskPath(id), { status }));
  }

  remove(id: number): Observable<unknown> {
    return defer(() => this.api.delete<unknown>(this.taskPath(id)));
  }

  private taskPath(id: number): string {
    if (!isTaskId(id)) {
      throw new Error('Invalid task id');
    }
    return `${TASKS_ENDPOINT}/${id}`;
  }
}
