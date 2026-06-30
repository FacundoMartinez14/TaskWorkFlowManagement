export type TaskItemStatus = 'ToDo' | 'InProgress' | 'Done';

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
