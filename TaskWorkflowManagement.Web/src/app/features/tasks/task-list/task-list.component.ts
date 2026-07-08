import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';

import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskItem } from '../../../models/task-item';
import { TaskItemsService } from '../../../services/task-items.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskCreateFormComponent } from '../task-create-form/task-create-form.component';
import { TaskDeleteDialogComponent } from '../task-delete-dialog/task-delete-dialog.component';
import { TaskEditDialogComponent } from '../task-edit-dialog/task-edit-dialog.component';

interface BoardColumn {
  status: TaskItemStatus;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-task-list',
  imports: [
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TaskCardComponent,
    TaskCreateFormComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly taskItemsService = inject(TaskItemsService);

  protected readonly boardColumns: readonly BoardColumn[] = [
    {
      status: TaskItemStatus.ToDo,
      title: 'To Do',
      description: 'Ready to start',
      icon: 'inbox'
    },
    {
      status: TaskItemStatus.InProgress,
      title: 'In Progress',
      description: 'Currently underway',
      icon: 'pending_actions'
    },
    {
      status: TaskItemStatus.Done,
      title: 'Done',
      description: 'Completed work',
      icon: 'task_alt'
    }
  ];
  protected readonly columnIds = this.boardColumns.map(column => this.columnId(column.status));
  protected readonly statusLabels: Record<TaskItemStatus, string> = {
    [TaskItemStatus.ToDo]: 'To Do',
    [TaskItemStatus.InProgress]: 'In Progress',
    [TaskItemStatus.Done]: 'Done'
  };
  protected readonly taskItems = signal<TaskItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isRefreshing = signal(false);
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
  protected readonly statusUpdateErrors = signal<Readonly<Partial<Record<string, string>>>>({});
  protected readonly deletingTaskItemIds = signal<ReadonlySet<string>>(new Set());
  protected readonly deleteErrors = signal<Readonly<Partial<Record<string, string>>>>({});
  private readonly hasLoaded = signal(false);

  ngOnInit(): void {
    this.loadTaskItems();
  }

  protected loadTaskItems(): void {
    if (this.hasLoaded()) {
      this.isRefreshing.set(true);
    } else {
      this.isLoading.set(true);
    }
    this.errorMessage.set(null);

    this.taskItemsService.getTaskItems().subscribe({
      next: taskItems => {
        this.taskItems.set(taskItems);
        this.hasLoaded.set(true);
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      },
      error: () => {
        if (this.hasLoaded()) {
          this.showSnackBar('Unable to refresh tasks. Please try again.', 'error-snackbar');
        } else {
          this.taskItems.set([]);
          this.errorMessage.set('Unable to load tasks. Make sure the backend API is running.');
        }
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      }
    });
  }

  protected addTaskItem(taskItem: TaskItem): void {
    this.taskItems.update(taskItems => [...taskItems, taskItem]);
    this.hasLoaded.set(true);
    this.isLoading.set(false);
    this.errorMessage.set(null);
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

  protected isStatusUpdating(taskItemId: string): boolean {
    return this.updatingTaskItemIds().has(taskItemId);
  }

  protected isTaskBusy(taskItemId: string): boolean {
    return this.isStatusUpdating(taskItemId) || this.isDeleting(taskItemId);
  }

  protected openEditDialog(taskItem: TaskItem): void {
    if (this.isTaskBusy(taskItem.id)) {
      return;
    }

    this.dialog.open<TaskEditDialogComponent, TaskItem, TaskItem>(TaskEditDialogComponent, {
      data: taskItem,
      maxWidth: '600px',
      width: 'calc(100% - 32px)'
    }).afterClosed().subscribe(updatedTaskItem => {
      if (updatedTaskItem) {
        this.taskItems.update(taskItems =>
          taskItems.map(item => item.id === updatedTaskItem.id ? updatedTaskItem : item)
        );
        this.showSnackBar('Task updated.', 'success-snackbar');
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
