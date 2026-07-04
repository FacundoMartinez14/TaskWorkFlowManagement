import type { TaskItemStatus } from './task-item-status';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskItemStatus;
  createdAtUtc: string;
}

export interface CreateTaskItemRequest {
  title: string;
  description: string | null;
}

export interface UpdateTaskItemStatusRequest {
  status: TaskItemStatus;
}
