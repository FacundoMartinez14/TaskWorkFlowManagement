import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskItem } from '../../../models/task-item';
import { TaskItemsService } from '../../../services/task-items.service';
import { TaskCreateFormComponent } from '../task-create-form/task-create-form.component';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe, TaskCreateFormComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private readonly taskItemsService = inject(TaskItemsService);

  protected readonly taskItems = signal<TaskItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hasTaskItems = computed(() => this.taskItems().length > 0);
  protected readonly taskItemStatuses = Object.values(TaskItemStatus);
  protected readonly updatingTaskItemIds = signal<ReadonlySet<string>>(new Set());
  protected readonly statusUpdateErrors = signal<Readonly<Record<string, string>>>({});

  ngOnInit(): void {
    this.loadTaskItems();
  }

  protected loadTaskItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskItemsService.getTaskItems().subscribe({
      next: taskItems => {
        this.taskItems.set(taskItems);
        this.isLoading.set(false);
      },
      error: () => {
        this.taskItems.set([]);
        this.errorMessage.set('Unable to load task items. Make sure the backend API is running.');
        this.isLoading.set(false);
      }
    });
  }

  protected updateStatus(taskItem: TaskItem, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as TaskItemStatus;

    if (status === taskItem.status || this.isStatusUpdating(taskItem.id)) {
      return;
    }

    this.updatingTaskItemIds.update(ids => new Set(ids).add(taskItem.id));
    this.statusUpdateErrors.update(errors => {
      const nextErrors = { ...errors };
      delete nextErrors[taskItem.id];
      return nextErrors;
    });

    this.taskItemsService.updateTaskItemStatus(taskItem.id, { status }).subscribe({
      next: () => {
        this.taskItems.update(taskItems =>
          taskItems.map(item => item.id === taskItem.id ? { ...item, status } : item)
        );
        this.finishStatusUpdate(taskItem.id);
      },
      error: () => {
        select.value = taskItem.status;
        this.statusUpdateErrors.update(errors => ({
          ...errors,
          [taskItem.id]: 'Unable to update status. Please try again.'
        }));
        this.finishStatusUpdate(taskItem.id);
      }
    });
  }

  protected isStatusUpdating(taskItemId: string): boolean {
    return this.updatingTaskItemIds().has(taskItemId);
  }

  private finishStatusUpdate(taskItemId: string): void {
    this.updatingTaskItemIds.update(ids => {
      const nextIds = new Set(ids);
      nextIds.delete(taskItemId);
      return nextIds;
    });
  }
}
