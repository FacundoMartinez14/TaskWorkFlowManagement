import type { TaskItemStatus } from './task-item-status';

export const TASK_ITEM_TITLE_MAX_LENGTH = 200;

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

export interface UpdateTaskItemRequest {
  title: string;
  description: string | null;
}

export interface UpdateTaskItemStatusRequest {
  status: TaskItemStatus;
}
