import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TASK_TITLE_MAX_LENGTH, TaskStatus, statusLabel } from '../../domain/task.model';
import { TaskStore } from '../../state/task.store';

@Component({
  selector: 'app-task-list',
  imports: [ReactiveFormsModule],
  providers: [TaskStore],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskList implements OnInit {
  protected readonly store = inject(TaskStore);
  protected readonly titleMaxLength = TASK_TITLE_MAX_LENGTH;
  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(TASK_TITLE_MAX_LENGTH)],
    }),
  });

  ngOnInit(): void {
    void this.store.load();
  }

  protected async submit(): Promise<void> {
    if (await this.store.add(this.form.controls.title.value)) {
      this.form.reset();
    }
  }

  protected label(status: TaskStatus): string {
    return statusLabel(status);
  }
}
