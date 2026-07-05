import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CreateTaskItemRequest,
  TASK_ITEM_TITLE_MAX_LENGTH
} from '../../../models/task-item';
import { TaskItemsService } from '../../../services/task-items.service';

@Component({
  selector: 'app-task-create-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-create-form.component.html',
  styleUrl: './task-create-form.component.css'
})
export class TaskCreateFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskItemsService = inject(TaskItemsService);

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
        this.taskForm.reset();
        this.isSubmitting.set(false);
        this.taskCreated.emit();
      },
      error: () => {
        this.errorMessage.set('Unable to create the task. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }
}
