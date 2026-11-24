export const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;
export const TASK_TITLE_MAX_LENGTH = 200;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
}

export interface NewTask {
  title: string;
  status: TaskStatus;
}

const NEXT_STATUS: Readonly<Record<TaskStatus, TaskStatus>> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

const STATUS_LABELS: Readonly<Record<TaskStatus, string>> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
};

export function nextStatus(status: TaskStatus): TaskStatus {
  return NEXT_STATUS[status];
}

export function statusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status];
}

export function normalizeTitle(title: string): string | null {
  const normalized = title.trim();
  return normalized.length > 0 && normalized.length <= TASK_TITLE_MAX_LENGTH ? normalized : null;
}

export function isTaskId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const description = candidate['description'];
  return (
    isTaskId(candidate['id']) &&
    typeof candidate['title'] === 'string' &&
    TASK_STATUSES.includes(candidate['status'] as TaskStatus) &&
    (description === undefined || description === null || typeof description === 'string')
  );
}
