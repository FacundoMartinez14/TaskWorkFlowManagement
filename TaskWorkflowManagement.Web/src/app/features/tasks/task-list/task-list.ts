import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { TaskItem } from '../../../models/task-item';
import { TaskItemsService } from '../../../services/task-items.service';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskList implements OnInit {
  private readonly taskItemsService = inject(TaskItemsService);

  protected readonly taskItems = signal<TaskItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hasTaskItems = computed(() => this.taskItems().length > 0);

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
}
