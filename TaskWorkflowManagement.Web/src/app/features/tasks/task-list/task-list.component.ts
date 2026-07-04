import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskItem, UpdateTaskItemRequest } from '../../../models/task-item';
import { TaskItemsService } from '../../../services/task-items.service';
import { TaskCreateFormComponent } from '../task-create-form/task-create-form.component';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe, ReactiveFormsModule, TaskCreateFormComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskItemsService = inject(TaskItemsService);

  protected readonly taskItems = signal<TaskItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hasTaskItems = computed(() => this.taskItems().length > 0);
  protected readonly taskItemStatuses = Object.values(TaskItemStatus);
  protected readonly updatingTaskItemIds = signal<ReadonlySet<string>>(new Set());
  protected readonly statusUpdateErrors = signal<Readonly<Record<string, string>>>({});
  protected readonly editingTaskItemId = signal<string | null>(null);
  protected readonly isSavingEdit = signal(false);
  protected readonly editErrorMessage = signal<string | null>(null);
  protected readonly deletingTaskItemIds = signal<ReadonlySet<string>>(new Set());
  protected readonly deleteErrors = signal<Readonly<Record<string, string>>>({});
  protected readonly editForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    description: ['']
  });

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

  protected startEditing(taskItem: TaskItem): void {
    if (this.isSavingEdit() || this.isDeleting(taskItem.id)) {
      return;
    }

    this.editingTaskItemId.set(taskItem.id);
    this.editErrorMessage.set(null);
    this.editForm.setValue({
      title: taskItem.title,
      description: taskItem.description ?? ''
    });
  }

  protected cancelEditing(): void {
    if (this.isSavingEdit()) {
      return;
    }

    this.editingTaskItemId.set(null);
    this.editErrorMessage.set(null);
    this.editForm.reset();
  }

  protected saveEdit(taskItem: TaskItem): void {
    if (this.editForm.invalid || this.isSavingEdit()) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.getRawValue();
    const request: UpdateTaskItemRequest = {
      title: formValue.title.trim(),
      description: formValue.description.trim() || null
    };

    this.isSavingEdit.set(true);
    this.editErrorMessage.set(null);

    this.taskItemsService.updateTaskItem(taskItem.id, request).subscribe({
      next: () => {
        this.taskItems.update(taskItems =>
          taskItems.map(item => item.id === taskItem.id ? { ...item, ...request } : item)
        );
        this.isSavingEdit.set(false);
        this.editingTaskItemId.set(null);
        this.editForm.reset();
      },
      error: () => {
        this.editErrorMessage.set('Unable to save changes. Please try again.');
        this.isSavingEdit.set(false);
      }
    });
  }

  protected deleteTaskItem(taskItem: TaskItem): void {
    if (this.isDeleting(taskItem.id) || this.isStatusUpdating(taskItem.id)) {
      return;
    }

    const confirmed = window.confirm(`Remove "${taskItem.title}" from the task list?`);
    if (!confirmed) {
      return;
    }

    this.deletingTaskItemIds.update(ids => new Set(ids).add(taskItem.id));
    this.deleteErrors.update(errors => {
      const nextErrors = { ...errors };
      delete nextErrors[taskItem.id];
      return nextErrors;
    });

    this.taskItemsService.deleteTaskItem(taskItem.id).subscribe({
      next: () => {
        this.taskItems.update(taskItems => taskItems.filter(item => item.id !== taskItem.id));
        this.finishDelete(taskItem.id);
      },
      error: () => {
        this.deleteErrors.update(errors => ({
          ...errors,
          [taskItem.id]: 'Unable to delete the task. Please try again.'
        }));
        this.finishDelete(taskItem.id);
      }
    });
  }

  protected isDeleting(taskItemId: string): boolean {
    return this.deletingTaskItemIds().has(taskItemId);
  }

  private finishStatusUpdate(taskItemId: string): void {
    this.updatingTaskItemIds.update(ids => {
      const nextIds = new Set(ids);
      nextIds.delete(taskItemId);
      return nextIds;
    });
  }

  private finishDelete(taskItemId: string): void {
    this.deletingTaskItemIds.update(ids => {
      const nextIds = new Set(ids);
      nextIds.delete(taskItemId);
      return nextIds;
    });
  }
}
