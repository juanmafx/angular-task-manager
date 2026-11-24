import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { toUserMessage } from '../../../core/http/api-error';
import { TaskApi } from '../data/task-api.service';
import { Task, nextStatus, normalizeTitle, TASK_TITLE_MAX_LENGTH } from '../domain/task.model';

@Injectable()
export class TaskStore {
  private readonly api = inject(TaskApi);
  private readonly tasksState = signal<readonly Task[]>([]);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private latestLoad = 0;

  readonly tasks = this.tasksState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isEmpty = computed(
    () => !this.loadingState() && !this.errorState() && this.tasksState().length === 0,
  );

  async load(): Promise<void> {
    const loadId = ++this.latestLoad;
    this.loadingState.set(true);
    try {
      const tasks = await firstValueFrom(this.api.list());
      if (loadId === this.latestLoad) {
        this.tasksState.set(tasks);
      }
    } catch (error) {
      if (loadId === this.latestLoad) {
        this.errorState.set(toUserMessage(error));
      }
    } finally {
      if (loadId === this.latestLoad) {
        this.loadingState.set(false);
      }
    }
  }

  add(rawTitle: string): Promise<boolean> {
    const title = normalizeTitle(rawTitle);
    if (title === null) {
      this.errorState.set(`Enter a title between 1 and ${TASK_TITLE_MAX_LENGTH} characters.`);
      return Promise.resolve(false);
    }
    return this.mutate(() => this.api.create({ title, status: 'pending' }));
  }

  advanceStatus(task: Task): Promise<boolean> {
    return this.mutate(() => this.api.updateStatus(task.id, nextStatus(task.status)));
  }

  remove(id: number): Promise<boolean> {
    return this.mutate(() => this.api.remove(id));
  }

  private async mutate(operation: () => Observable<unknown>): Promise<boolean> {
    if (this.savingState()) {
      return false;
    }
    this.savingState.set(true);
    this.errorState.set(null);
    try {
      await firstValueFrom(operation());
    } catch (error) {
      this.errorState.set(toUserMessage(error));
      this.savingState.set(false);
      return false;
    }
    await this.load();
    this.savingState.set(false);
    return true;
  }
}
