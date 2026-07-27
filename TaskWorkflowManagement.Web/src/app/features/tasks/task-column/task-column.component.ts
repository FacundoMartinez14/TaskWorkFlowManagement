import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { TaskItem } from '../../../models/task-item';
import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskCardComponent, TaskStatusOption } from '../task-card/task-card.component';

export interface BoardColumn {
  status: TaskItemStatus;
  title: string;
  description: string;
  icon: string;
}

export interface TaskMoveRequest {
  taskItem: TaskItem;
  status: TaskItemStatus;
}

@Component({
  selector: 'app-task-column',
  imports: [DragDropModule, MatIconModule, TaskCardComponent],
  templateUrl: './task-column.component.html',
  styleUrl: './task-column.component.css'
})
export class TaskColumnComponent {
  readonly column = input.required<BoardColumn>();
  readonly taskItems = input.required<TaskItem[]>();
  readonly connectedColumnIds = input.required<string[]>();
  readonly statusOptions = input.required<readonly TaskStatusOption[]>();
  readonly updatingTaskItemIds = input.required<ReadonlySet<string>>();
  readonly statusUpdateErrors = input.required<Readonly<Partial<Record<string, string>>>>();
  readonly deletingTaskItemIds = input.required<ReadonlySet<string>>();
  readonly deleteErrors = input.required<Readonly<Partial<Record<string, string>>>>();

  readonly editRequested = output<TaskItem>();
  readonly deleteRequested = output<TaskItem>();
  readonly moveRequested = output<TaskMoveRequest>();

  protected columnId(): string {
    return `task-column-${this.column().status}`;
  }

  protected taskCountLabel(): string {
    const count = this.taskItems().length;
    return `${count} ${count === 1 ? 'task' : 'tasks'}`;
  }

  protected dropTask(event: CdkDragDrop<TaskItem[]>): void {
    this.requestMove(event.item.data as TaskItem, this.column().status);
  }

  protected requestMove(taskItem: TaskItem, status: TaskItemStatus): void {
    this.moveRequested.emit({ taskItem, status });
  }
}
