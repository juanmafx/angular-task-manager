import { Routes } from '@angular/router';
import { TaskList } from './ui/task-list/task-list';

export const TASK_ROUTES: Routes = [{ path: '', component: TaskList, title: 'Tasks' }];
