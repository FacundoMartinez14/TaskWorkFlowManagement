import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateTaskItemRequest,
  TaskItem,
  UpdateTaskItemStatusRequest
} from '../models/task-item';

@Injectable({
  providedIn: 'root'
})
export class TaskItemsService {
  private readonly http = inject(HttpClient);
  private readonly taskItemsUrl = '/api/tasks';

  getTaskItems(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.taskItemsUrl);
  }

  createTaskItem(request: CreateTaskItemRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.taskItemsUrl, request);
  }

  updateTaskItemStatus(id: string, request: UpdateTaskItemStatusRequest): Observable<void> {
    return this.http.patch<void>(`${this.taskItemsUrl}/${id}/status`, request);
  }
}
