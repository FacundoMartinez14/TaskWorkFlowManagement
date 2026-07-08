import { Component, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CreateTaskItemRequest, TASK_ITEM_TITLE_MAX_LENGTH } from '../../../models/task-item';
import { TaskItemsService } from '../../../services/task-items.service';

@Component({
  selector: 'app-task-create-form',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './task-create-form.component.html',
  styleUrl: './task-create-form.component.css'
})
export class TaskCreateFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly taskItemsService = inject(TaskItemsService);
  private readonly taskFormDirective = viewChild.required(FormGroupDirective);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly titleMaxLength = TASK_ITEM_TITLE_MAX_LENGTH;
  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: [
      '',
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(TASK_ITEM_TITLE_MAX_LENGTH)]
    ],
    description: ['']
  });

  readonly taskCreated = output<void>();

  protected submit(): void {
    if (this.taskForm.invalid || this.isSubmitting()) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.getRawValue();
    const request: CreateTaskItemRequest = {
      title: formValue.title.trim(),
      description: formValue.description.trim() || null
    };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.taskItemsService.createTaskItem(request).subscribe({
      next: () => {
        this.taskFormDirective().resetForm({ title: '', description: '' });
        this.isSubmitting.set(false);
        this.taskCreated.emit();
        this.showSnackBar('Task created.', 'success-snackbar');
      },
      error: () => {
        const message = 'Unable to create the task. Please try again.';
        this.errorMessage.set(message);
        this.isSubmitting.set(false);
        this.showSnackBar(message, 'error-snackbar');
      }
    });
  }

  private showSnackBar(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 3500, panelClass });
  }
}
