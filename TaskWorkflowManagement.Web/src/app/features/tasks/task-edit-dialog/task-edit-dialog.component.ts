import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Observable, forkJoin } from 'rxjs';

import {
  TASK_ITEM_TITLE_MAX_LENGTH,
  TaskItem,
  UpdateTaskItemRequest
} from '../../../models/task-item';
import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskItemsService } from '../../../services/task-items.service';

@Component({
  selector: 'app-task-edit-dialog',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './task-edit-dialog.component.html',
  styleUrl: './task-edit-dialog.component.css'
})
export class TaskEditDialogComponent {
  private readonly data = inject<TaskItem>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TaskEditDialogComponent, TaskItem>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskItemsService = inject(TaskItemsService);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly titleMaxLength = TASK_ITEM_TITLE_MAX_LENGTH;
  protected readonly taskItemStatuses = Object.values(TaskItemStatus);
  protected readonly statusLabels: Record<TaskItemStatus, string> = {
    [TaskItemStatus.ToDo]: 'To Do',
    [TaskItemStatus.InProgress]: 'In Progress',
    [TaskItemStatus.Done]: 'Done'
  };
  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: [
      this.data.title,
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(TASK_ITEM_TITLE_MAX_LENGTH)]
    ],
    description: [this.data.description ?? ''],
    status: [this.data.status]
  });

  protected cancel(): void {
    if (!this.isSaving()) {
      this.dialogRef.close();
    }
  }

  protected save(): void {
    if (this.taskForm.invalid || this.isSaving()) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.getRawValue();
    const updateRequest: UpdateTaskItemRequest = {
      title: formValue.title.trim(),
      description: formValue.description.trim() || null
    };
    const updatedTaskItem: TaskItem = {
      ...this.data,
      ...updateRequest,
      status: formValue.status
    };
    const updates: Observable<void>[] = [];

    if (updateRequest.title !== this.data.title || updateRequest.description !== this.data.description) {
      updates.push(this.taskItemsService.updateTaskItem(this.data.id, updateRequest));
    }

    if (formValue.status !== this.data.status) {
      updates.push(this.taskItemsService.updateTaskItemStatus(this.data.id, { status: formValue.status }));
    }

    if (updates.length === 0) {
      this.dialogRef.close(this.data);
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    forkJoin(updates).subscribe({
      next: () => this.dialogRef.close(updatedTaskItem),
      error: () => {
        this.errorMessage.set('Unable to save all task changes. Please try again.');
        this.isSaving.set(false);
      }
    });
  }
}
