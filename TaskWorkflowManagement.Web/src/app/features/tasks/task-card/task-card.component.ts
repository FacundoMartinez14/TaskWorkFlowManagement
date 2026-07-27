import { DatePipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TaskItem } from '../../../models/task-item';
import { TaskItemStatus } from '../../../models/task-item-status';

export interface TaskStatusOption {
  status: TaskItemStatus;
  label: string;
}

@Component({
  selector: 'app-task-card',
  imports: [
    DatePipe,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  readonly taskItem = input.required<TaskItem>();
  readonly statusOptions = input.required<readonly TaskStatusOption[]>();
  readonly isStatusUpdating = input(false);
  readonly statusError = input<string | null>(null);
  readonly isDeleting = input(false);
  readonly deleteError = input<string | null>(null);

  readonly editRequested = output<void>();
  readonly deleteRequested = output<void>();
  readonly moveRequested = output<TaskItemStatus>();

  protected readonly isBusy = computed(() => this.isStatusUpdating() || this.isDeleting());
  protected readonly moveTargets = computed(() =>
    this.statusOptions().filter(option => option.status !== this.taskItem().status)
  );

  protected requestEdit(): void {
    if (!this.isBusy()) {
      this.editRequested.emit();
    }
  }

  protected requestDelete(): void {
    if (!this.isBusy()) {
      this.deleteRequested.emit();
    }
  }

  protected requestMove(status: TaskItemStatus): void {
    if (!this.isBusy() && status !== this.taskItem().status) {
      this.moveRequested.emit(status);
    }
  }
}
