import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core';
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
import { TaskStatusOption } from '../task-card/task-card.component';
import { BoardColumn, TaskColumnComponent } from '../task-column/task-column.component';
import { TaskCreateFormComponent } from '../task-create-form/task-create-form.component';
import { TaskDeleteDialogComponent } from '../task-delete-dialog/task-delete-dialog.component';
import { TaskEditDialogComponent } from '../task-edit-dialog/task-edit-dialog.component';

@Component({
  selector: 'app-task-list',
  imports: [
    A11yModule,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TaskColumnComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
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
  protected readonly statusOptions: readonly TaskStatusOption[] = this.boardColumns.map(column => ({
    status: column.status,
    label: column.title
  }));
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

  public openCreateDialog(): void {
    const trigger = this.activeElement();
    const dialogRef = this.dialog.open<TaskCreateFormComponent, void, TaskItem>(
      TaskCreateFormComponent,
      {
        autoFocus: '#task-create-title',
        maxWidth: '600px',
        restoreFocus: false,
        width: 'calc(100% - 32px)'
      }
    );

    dialogRef.afterClosed().subscribe(createdTaskItem => {
      if (createdTaskItem) {
        this.addTaskItem(createdTaskItem);
      }

      this.changeDetectorRef.detectChanges();
      this.restoreCreateTrigger(trigger, createdTaskItem?.id);
    });
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

  protected moveTask(taskItem: TaskItem, status: TaskItemStatus): void {
    if (taskItem.status === status || this.isTaskBusy(taskItem.id)) {
      return;
    }

    this.changeStatus(taskItem, status);
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
      autoFocus: '#task-edit-title',
      data: taskItem,
      maxWidth: '600px',
      restoreFocus: false,
      width: 'calc(100% - 32px)'
    }).afterClosed().subscribe(updatedTaskItem => {
      if (updatedTaskItem) {
        this.taskItems.update(taskItems =>
          taskItems.map(item => item.id === updatedTaskItem.id ? updatedTaskItem : item)
        );
        this.showSnackBar('Task updated.', 'success-snackbar');
      }

      this.changeDetectorRef.detectChanges();
      this.focusTaskActions(taskItem.id);
    });
  }

  protected confirmDelete(taskItem: TaskItem): void {
    if (this.isTaskBusy(taskItem.id)) {
      return;
    }

    const focusFallback = this.taskRemovalFocusFallback(taskItem);
    this.dialog.open(TaskDeleteDialogComponent, {
      autoFocus: 'first-tabbable',
      data: { title: taskItem.title },
      maxWidth: '440px',
      restoreFocus: false,
      width: 'calc(100% - 32px)'
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteTaskItem(taskItem, focusFallback);
      } else {
        this.focusTaskActions(taskItem.id);
      }
    });
  }

  protected isDeleting(taskItemId: string): boolean {
    return this.deletingTaskItemIds().has(taskItemId);
  }

  private changeStatus(taskItem: TaskItem, status: TaskItemStatus): void {
    const sourceStatus = taskItem.status;
    const sourceTaskIds = this.tasksForStatus(sourceStatus).map(item => item.id);
    const sourceIndex = sourceTaskIds.indexOf(taskItem.id);
    const fallbackTaskId =
      sourceTaskIds[sourceIndex + 1] ?? sourceTaskIds[sourceIndex - 1] ?? null;

    this.updatingTaskItemIds.update(ids => new Set(ids).add(taskItem.id));
    this.clearItemError(this.statusUpdateErrors, taskItem.id);

    this.taskItemsService.updateTaskItemStatus(taskItem.id, { status }).subscribe({
      next: () => {
        this.taskItems.update(taskItems =>
          taskItems.map(item => item.id === taskItem.id ? { ...item, status } : item)
        );
        this.finishStatusUpdate(taskItem.id);
        this.changeDetectorRef.detectChanges();
        this.restoreFocusAfterMove(taskItem, fallbackTaskId, sourceStatus);
        const announcement = `Task ${taskItem.title} moved to ${this.statusLabel(status)}`;
        void this.liveAnnouncer.announce(announcement, 'polite');
        this.showSnackBar(`${announcement}.`, 'success-snackbar');
      },
      error: () => {
        const message = 'Unable to update status. Please try again.';
        this.statusUpdateErrors.update(errors => ({ ...errors, [taskItem.id]: message }));
        this.finishStatusUpdate(taskItem.id);
        this.changeDetectorRef.detectChanges();
        this.focusTaskActions(taskItem.id);
        this.showSnackBar(message, 'error-snackbar');
      }
    });
  }

  private deleteTaskItem(
    taskItem: TaskItem,
    focusFallback: { taskItemId: string | null; status: TaskItemStatus }
  ): void {
    this.deletingTaskItemIds.update(ids => new Set(ids).add(taskItem.id));
    this.clearItemError(this.deleteErrors, taskItem.id);

    this.taskItemsService.deleteTaskItem(taskItem.id).subscribe({
      next: () => {
        this.taskItems.update(taskItems => taskItems.filter(item => item.id !== taskItem.id));
        this.finishDelete(taskItem.id);
        this.changeDetectorRef.detectChanges();
        this.focusTaskOrHeading(focusFallback.taskItemId, focusFallback.status);
        this.showSnackBar('Task deleted.', 'success-snackbar');
      },
      error: () => {
        const message = 'Unable to delete the task. Please try again.';
        this.deleteErrors.update(errors => ({ ...errors, [taskItem.id]: message }));
        this.finishDelete(taskItem.id);
        this.changeDetectorRef.detectChanges();
        this.focusTaskActions(taskItem.id);
        this.showSnackBar(message, 'error-snackbar');
      }
    });
  }

  private activeElement(): HTMLElement | null {
    const activeElement = this.document.activeElement;
    return activeElement instanceof HTMLElement ? activeElement : null;
  }

  private restoreCreateTrigger(trigger: HTMLElement | null, createdTaskItemId?: string): void {
    if (trigger?.isConnected) {
      trigger.focus();
      return;
    }

    const persistentCreateTrigger = this.document.getElementById('new-task-button');
    if (persistentCreateTrigger) {
      persistentCreateTrigger.focus();
      return;
    }

    if (createdTaskItemId) {
      this.focusElement(this.document.getElementById(this.taskCardId(createdTaskItemId)));
    }
  }

  private restoreFocusAfterMove(
    taskItem: TaskItem,
    fallbackTaskId: string | null,
    sourceStatus: TaskItemStatus
  ): void {
    const movedCard = this.document.getElementById(this.taskCardId(taskItem.id));
    if (movedCard) {
      this.focusElement(movedCard);
      return;
    }

    this.focusTaskOrHeading(fallbackTaskId, sourceStatus);
  }

  private focusTaskOrHeading(taskItemId: string | null, status: TaskItemStatus): void {
    const fallbackCard = taskItemId
      ? this.document.getElementById(this.taskCardId(taskItemId))
      : null;
    const heading = this.document.getElementById(`${this.columnId(status)}-heading`);
    this.focusElement(fallbackCard ?? heading);
  }

  private focusTaskActions(taskItemId: string): void {
    this.focusElement(this.document.getElementById(`task-actions-${taskItemId}`));
  }

  private focusElement(element: HTMLElement | null): void {
    if (!element) {
      return;
    }

    element.focus({ preventScroll: true });
    const bounds = element.getBoundingClientRect();
    const viewportHeight = this.document.defaultView?.innerHeight ?? 0;
    if (bounds.top < 0 || bounds.bottom > viewportHeight) {
      element.scrollIntoView({ block: 'nearest' });
    }
  }

  private taskRemovalFocusFallback(
    taskItem: TaskItem
  ): { taskItemId: string | null; status: TaskItemStatus } {
    const taskIds = this.tasksForStatus(taskItem.status).map(item => item.id);
    const taskIndex = taskIds.indexOf(taskItem.id);
    return {
      taskItemId: taskIds[taskIndex + 1] ?? taskIds[taskIndex - 1] ?? null,
      status: taskItem.status
    };
  }

  private taskCardId(taskItemId: string): string {
    return `task-card-${taskItemId}`;
  }

  private statusLabel(status: TaskItemStatus): string {
    return this.boardColumns.find(column => column.status === status)?.title ?? status;
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
