import { Component } from '@angular/core';

import { TaskList } from './features/tasks/task-list/task-list';

@Component({
  selector: 'app-root',
  imports: [TaskList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
