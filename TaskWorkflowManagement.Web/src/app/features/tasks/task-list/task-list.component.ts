import { DatePipe } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';

import { TaskItemStatus } from '../../../models/task-item-status';
import { TASK_ITEM_TITLE_MAX_LENGTH, TaskItem, UpdateTaskItemRequest } from '../../../models/task-item';
import { TaskItemsService } from '../../../services/task-items.service';
import { TaskCreateFormComponent } from '../task-create-form/task-create-form.component';
import { TaskDeleteDialogComponent } from '../task-delete-dialog/task-delete-dialog.component';

interface BoardColumn {
  status: TaskItemStatus;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TaskCreateFormComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly taskItemsService = inject(TaskItemsService);

  protected readonly boardColumns: readonly BoardColumn[] = [
    { status: TaskItemStatus.ToDo, title: 'To Do', description: 'Ready to start', icon: 'inbox' },
    { status: TaskItemStatus.InProgress, title: 'In Progress', description: 'Currently underway', icon: 'pending_actions' },
    { status: TaskItemStatus.Done, title: 'Done', description: 'Completed work', icon: 'task_alt' }
  ];
  protected readonly columnIds = this.boardColumns.map(column => this.columnId(column.status));
  protected readonly taskItemStatuses = Object.values(TaskItemStatus);
  protected readonly statusLabels: Record<TaskItemStatus, string> = {
    [TaskItemStatus.ToDo]: 'To Do',
    [TaskItemStatus.InProgress]: 'In Progress',
    [TaskItemStatus.Done]: 'Done'
  };
  protected readonly titleMaxLength = TASK_ITEM_TITLE_MAX_LENGTH;
  protected readonly taskItems = signal<TaskItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filterControl = new FormControl('', { nonNullable: true });
  private readonly filterTerm = toSignal(this.filterControl.valueChanges, {
    initialValue: this.filterControl.value
  });
  protected readonly filteredTaskItems = computed(() => {
    const keyword = this.filterTerm().trim().toLocaleLowerCase();
    if (!keyword) {
      return this.taskItems();
    }

    return this.taskItems().filter(taskItem =>
      `${taskItem.title} ${taskItem.description ?? ''}`.toLocaleLowerCase().includes(keyword)
    );
  });
  protected readonly updatingTaskItemIds = signal<ReadonlySet<string>>(new Set());
  protected readonly statusUpdateErrors = signal<Readonly<Record<string, string>>>({});
  protected readonly editingTaskItemId = signal<string | null>(null);
  protected readonly isSavingEdit = signal(false);
  protected readonly editErrorMessage = signal<string | null>(null);
  protected readonly deletingTaskItemIds = signal<ReadonlySet<string>>(new Set());
  protected readonly deleteErrors = signal<Readonly<Record<string, string>>>({});
  protected readonly editForm = this.formBuilder.nonNullable.group({
    title: [
      '',
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(TASK_ITEM_TITLE_MAX_LENGTH)]
    ],
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
        this.errorMessage.set('Unable to load tasks. Make sure the backend API is running.');
        this.isLoading.set(false);
      }
    });
  }

  protected tasksForStatus(status: TaskItemStatus): TaskItem[] {
    return this.filteredTaskItems().filter(taskItem => taskItem.status === status);
  }

  protected columnId(status: TaskItemStatus): string {
    return `task-column-${status}`;
  }

  protected dropTask(event: CdkDragDrop<TaskItem[]>, status: TaskItemStatus): void {
    const taskItem = event.item.data as TaskItem;
    if (taskItem.status === status || this.isTaskBusy(taskItem.id)) {
      return;
    }

    this.changeStatus(taskItem, status, `Task moved to ${this.statusLabels[status]}.`);
  }

  protected updateStatus(taskItem: TaskItem, status: TaskItemStatus): void {
    if (status === taskItem.status || this.isTaskBusy(taskItem.id)) {
      return;
    }

    this.changeStatus(taskItem, status, `Status updated to ${this.statusLabels[status]}.`);
  }

  protected isStatusUpdating(taskItemId: string): boolean {
    return this.updatingTaskItemIds().has(taskItemId);
  }

  protected isTaskBusy(taskItemId: string): boolean {
    return this.isStatusUpdating(taskItemId) || this.isDeleting(taskItemId) || this.isSavingEdit();
  }

  protected startEditing(taskItem: TaskItem): void {
    if (this.isTaskBusy(taskItem.id)) {
      return;
    }

    this.editingTaskItemId.set(taskItem.id);
    this.editErrorMessage.set(null);
    this.editForm.reset({ title: taskItem.title, description: taskItem.description ?? '' });
  }

  protected cancelEditing(): void {
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
        this.cancelEditing();
        this.showSnackBar('Task updated.', 'success-snackbar');
      },
      error: () => {
        const message = 'Unable to save the task. Please try again.';
        this.editErrorMessage.set(message);
        this.isSavingEdit.set(false);
        this.showSnackBar(message, 'error-snackbar');
      }
    });
  }

  protected confirmDelete(taskItem: TaskItem): void {
    this.dialog.open(TaskDeleteDialogComponent, {
      data: { title: taskItem.title },
      maxWidth: '440px',
      width: 'calc(100% - 32px)'
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteTaskItem(taskItem);
      }
    });
  }

  protected isDeleting(taskItemId: string): boolean {
    return this.deletingTaskItemIds().has(taskItemId);
  }

  private changeStatus(taskItem: TaskItem, status: TaskItemStatus, successMessage: string): void {
    this.updatingTaskItemIds.update(ids => new Set(ids).add(taskItem.id));
    this.clearItemError(this.statusUpdateErrors, taskItem.id);

    this.taskItemsService.updateTaskItemStatus(taskItem.id, { status }).subscribe({
      next: () => {
        this.taskItems.update(taskItems =>
          taskItems.map(item => item.id === taskItem.id ? { ...item, status } : item)
        );
        this.finishStatusUpdate(taskItem.id);
        this.showSnackBar(successMessage, 'success-snackbar');
      },
      error: () => {
        const message = 'Unable to update status. Please try again.';
        this.statusUpdateErrors.update(errors => ({ ...errors, [taskItem.id]: message }));
        this.finishStatusUpdate(taskItem.id);
        this.showSnackBar(message, 'error-snackbar');
      }
    });
  }

  private deleteTaskItem(taskItem: TaskItem): void {
    this.deletingTaskItemIds.update(ids => new Set(ids).add(taskItem.id));
    this.clearItemError(this.deleteErrors, taskItem.id);

    this.taskItemsService.deleteTaskItem(taskItem.id).subscribe({
      next: () => {
        this.taskItems.update(taskItems => taskItems.filter(item => item.id !== taskItem.id));
        this.finishDelete(taskItem.id);
        this.showSnackBar('Task deleted.', 'success-snackbar');
      },
      error: () => {
        const message = 'Unable to delete the task. Please try again.';
        this.deleteErrors.update(errors => ({ ...errors, [taskItem.id]: message }));
        this.finishDelete(taskItem.id);
        this.showSnackBar(message, 'error-snackbar');
      }
    });
  }

  private clearItemError(errorSignal: typeof this.statusUpdateErrors, taskItemId: string): void {
    errorSignal.update(errors => {
      const nextErrors = { ...errors };
      delete nextErrors[taskItemId];
      return nextErrors;
    });
  }

  private finishStatusUpdate(taskItemId: string): void {
    this.updatingTaskItemIds.update(ids => this.withoutId(ids, taskItemId));
  }

  private finishDelete(taskItemId: string): void {
    this.deletingTaskItemIds.update(ids => this.withoutId(ids, taskItemId));
  }

  private withoutId(ids: ReadonlySet<string>, taskItemId: string): ReadonlySet<string> {
    const nextIds = new Set(ids);
    nextIds.delete(taskItemId);
    return nextIds;
  }

  private showSnackBar(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 3500, panelClass });
  }
}
