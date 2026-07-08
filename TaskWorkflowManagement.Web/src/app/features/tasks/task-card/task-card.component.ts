import { DatePipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TaskItem } from '../../../models/task-item';

@Component({
  selector: 'app-task-card',
  imports: [
    DatePipe,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  readonly taskItem = input.required<TaskItem>();
  readonly isStatusUpdating = input(false);
  readonly statusError = input<string | null>(null);
  readonly isDeleting = input(false);
  readonly deleteError = input<string | null>(null);

  readonly editRequested = output<void>();
  readonly deleteRequested = output<void>();

  protected readonly isBusy = computed(() => this.isStatusUpdating() || this.isDeleting());

  protected requestEdit(): void {
    if (!this.isBusy()) {
      this.editRequested.emit();
    }
  }

  protected requestDelete(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.isBusy()) {
      this.deleteRequested.emit();
    }
  }
}
