import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Subject, of } from 'rxjs';

import { TaskItem } from '../../../models/task-item';
import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskItemsService } from '../../../services/task-items.service';
import { TaskListComponent } from './task-list.component';

describe('TaskListComponent', () => {
  const taskItem: TaskItem = {
    id: 'task-1',
    title: 'Prepare portfolio demo',
    description: 'Check the board states.',
    status: TaskItemStatus.ToDo,
    createdAtUtc: '2026-07-26T12:00:00Z'
  };
  let taskItemsService: jasmine.SpyObj<TaskItemsService>;

  beforeEach(async () => {
    taskItemsService = jasmine.createSpyObj<TaskItemsService>('TaskItemsService', [
      'getTaskItems',
      'createTaskItem',
      'updateTaskItem',
      'updateTaskItemStatus',
      'deleteTaskItem'
    ]);

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideNoopAnimations(),
        { provide: TaskItemsService, useValue: taskItemsService }
      ]
    }).compileComponents();
  });

  it('distinguishes initial loading, failure, retry, and empty data', () => {
    const initialRequest = new Subject<TaskItem[]>();
    taskItemsService.getTaskItems.and.returnValues(
      initialRequest.asObservable(),
      of([])
    );
    const fixture = createComponent();

    expect(fixture.nativeElement.textContent).toContain('Loading tasks');

    initialRequest.error(new Error('offline'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tasks could not be loaded');

    clickButton(fixture, 'Try again');
    expect(taskItemsService.getTaskItems).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('Your board is empty');
    expect(fixture.nativeElement.textContent).toContain('Create first task');
    const openCreateDialog = spyOn(fixture.componentInstance, 'openCreateDialog');
    clickButton(fixture, 'Create first task');
    expect(openCreateDialog).toHaveBeenCalledTimes(1);
  });

  it('keeps loaded cards visible while a refresh is in progress', () => {
    const refreshRequest = new Subject<TaskItem[]>();
    taskItemsService.getTaskItems.and.returnValues(of([taskItem]), refreshRequest.asObservable());
    const fixture = createComponent();

    clickButton(fixture, 'Refresh');

    expect(fixture.nativeElement.textContent).toContain(taskItem.title);
    expect(fixture.nativeElement.textContent).toContain('Refreshing...');
  });

  it('identifies an empty filter result and clears the filter', () => {
    taskItemsService.getTaskItems.and.returnValue(of([taskItem]));
    const fixture = createComponent();
    const filterInput = fixture.nativeElement.querySelector(
      'input[placeholder="Title or description"]'
    ) as HTMLInputElement;

    filterInput.value = 'does not exist';
    filterInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No tasks match “does not exist”');
    clickButton(fixture, 'Clear filter');
    expect(fixture.nativeElement.textContent).toContain(taskItem.title);
  });

  it('moves a task through the status service, focuses it, and announces the result', () => {
    taskItemsService.getTaskItems.and.returnValue(of([taskItem]));
    taskItemsService.updateTaskItemStatus.and.returnValue(of(undefined));
    const liveAnnouncer = TestBed.inject(LiveAnnouncer);
    const announce = spyOn(liveAnnouncer, 'announce').and.resolveTo();
    const fixture = createComponent();
    const moveTask = fixture.componentInstance as unknown as {
      moveTask(item: TaskItem, status: TaskItemStatus): void;
    };

    moveTask.moveTask(taskItem, TaskItemStatus.InProgress);

    expect(taskItemsService.updateTaskItemStatus).toHaveBeenCalledOnceWith(taskItem.id, {
      status: TaskItemStatus.InProgress
    });
    expect(document.activeElement?.id).toBe(`task-card-${taskItem.id}`);
    expect(announce).toHaveBeenCalledOnceWith(
      `Task ${taskItem.title} moved to In Progress`,
      'polite'
    );
  });

  it('falls back from a missing moved card to a source card and then the column heading', () => {
    taskItemsService.getTaskItems.and.returnValue(of([taskItem]));
    const fixture = createComponent();
    const focusAfterMove = fixture.componentInstance as unknown as {
      restoreFocusAfterMove(
        item: TaskItem,
        fallbackTaskId: string | null,
        sourceStatus: TaskItemStatus
      ): void;
    };
    const missingTask = { ...taskItem, id: 'missing-task' };

    focusAfterMove.restoreFocusAfterMove(missingTask, taskItem.id, TaskItemStatus.ToDo);
    expect(document.activeElement?.id).toBe(`task-card-${taskItem.id}`);

    focusAfterMove.restoreFocusAfterMove(missingTask, null, TaskItemStatus.ToDo);
    expect(document.activeElement?.id).toBe('task-column-ToDo-heading');
  });

  function createComponent(): ComponentFixture<TaskListComponent> {
    const fixture = TestBed.createComponent(TaskListComponent);
    fixture.detectChanges();
    return fixture;
  }
});

function clickButton(fixture: ComponentFixture<unknown>, label: string): void {
  const host = fixture.nativeElement as HTMLElement;
  const button = Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
    .find(candidate => candidate.textContent?.trim().includes(label));
  expect(button).withContext(`Expected the ${label} button`).toBeDefined();
  button?.click();
  fixture.detectChanges();
}
