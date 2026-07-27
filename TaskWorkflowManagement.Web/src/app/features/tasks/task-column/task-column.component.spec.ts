import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { TaskItem } from '../../../models/task-item';
import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskCardComponent, TaskStatusOption } from '../task-card/task-card.component';
import { BoardColumn, TaskColumnComponent } from './task-column.component';

describe('TaskColumnComponent', () => {
  const column: BoardColumn = {
    status: TaskItemStatus.ToDo,
    title: 'To Do',
    description: 'Ready to start',
    icon: 'inbox'
  };
  const taskItem: TaskItem = {
    id: 'task-1',
    title: 'Prepare portfolio demo',
    description: 'Check the board states.',
    status: TaskItemStatus.ToDo,
    createdAtUtc: '2026-07-26T12:00:00Z'
  };
  const statusOptions: readonly TaskStatusOption[] = [
    { status: TaskItemStatus.ToDo, label: 'To Do' },
    { status: TaskItemStatus.InProgress, label: 'In Progress' },
    { status: TaskItemStatus.Done, label: 'Done' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskColumnComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('renders its heading, task count, and cards from typed inputs', () => {
    const fixture = createComponent([taskItem]);
    const heading = fixture.nativeElement.querySelector('h3') as HTMLHeadingElement;
    const count = fixture.nativeElement.querySelector('.task-count') as HTMLElement;

    expect(heading.id).toBe('task-column-ToDo-heading');
    expect(heading.textContent).toContain('To Do');
    expect(count.textContent?.trim()).toBe('1');
    expect(count.getAttribute('aria-label')).toBe('1 task');
    expect(fixture.nativeElement.textContent).toContain(taskItem.title);
  });

  it('renders an actionable drop target when the column is empty', () => {
    const fixture = createComponent([]);

    expect(fixture.nativeElement.textContent).toContain('Drop a task here');
    expect(fixture.nativeElement.querySelector('.task-count').textContent.trim()).toBe('0');
  });

  it('forwards card actions and accessible status moves to the board owner', () => {
    const fixture = createComponent([taskItem]);
    const editRequested = jasmine.createSpy('editRequested');
    const deleteRequested = jasmine.createSpy('deleteRequested');
    const moveRequested = jasmine.createSpy('moveRequested');
    fixture.componentInstance.editRequested.subscribe(editRequested);
    fixture.componentInstance.deleteRequested.subscribe(deleteRequested);
    fixture.componentInstance.moveRequested.subscribe(moveRequested);
    const taskCard = fixture.debugElement.query(By.directive(TaskCardComponent))
      .componentInstance as TaskCardComponent;

    taskCard.editRequested.emit();
    taskCard.deleteRequested.emit();
    taskCard.moveRequested.emit(TaskItemStatus.InProgress);

    expect(editRequested).toHaveBeenCalledOnceWith(taskItem);
    expect(deleteRequested).toHaveBeenCalledOnceWith(taskItem);
    expect(moveRequested).toHaveBeenCalledOnceWith({
      taskItem,
      status: TaskItemStatus.InProgress
    });
  });

  function createComponent(taskItems: TaskItem[]) {
    const fixture = TestBed.createComponent(TaskColumnComponent);
    fixture.componentRef.setInput('column', column);
    fixture.componentRef.setInput('taskItems', taskItems);
    fixture.componentRef.setInput('connectedColumnIds', [
      'task-column-ToDo',
      'task-column-InProgress',
      'task-column-Done'
    ]);
    fixture.componentRef.setInput('statusOptions', statusOptions);
    fixture.componentRef.setInput('updatingTaskItemIds', new Set<string>());
    fixture.componentRef.setInput('statusUpdateErrors', {});
    fixture.componentRef.setInput('deletingTaskItemIds', new Set<string>());
    fixture.componentRef.setInput('deleteErrors', {});
    fixture.detectChanges();
    return fixture;
  }
});
