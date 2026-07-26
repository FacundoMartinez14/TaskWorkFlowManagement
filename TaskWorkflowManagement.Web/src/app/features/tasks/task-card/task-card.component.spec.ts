import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { TaskItem } from '../../../models/task-item';
import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskCardComponent } from './task-card.component';

describe('TaskCardComponent', () => {
  const taskItem: TaskItem = {
    id: 'task-1',
    title: 'Prepare portfolio demo',
    description: 'Check the task board at mobile and desktop sizes.',
    status: TaskItemStatus.ToDo,
    createdAtUtc: '2026-07-26T12:00:00Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('emits edit and delete requests from its action handlers', () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput('taskItem', taskItem);
    const editRequested = jasmine.createSpy('editRequested');
    const deleteRequested = jasmine.createSpy('deleteRequested');
    fixture.componentInstance.editRequested.subscribe(editRequested);
    fixture.componentInstance.deleteRequested.subscribe(deleteRequested);
    fixture.detectChanges();
    const actionHandlers = fixture.componentInstance as unknown as {
      requestEdit(): void;
      requestDelete(): void;
    };

    actionHandlers.requestEdit();
    expect(editRequested).toHaveBeenCalledTimes(1);

    actionHandlers.requestDelete();
    expect(deleteRequested).toHaveBeenCalledTimes(1);
  });

  it('disables card operations while an operation is in progress', () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput('taskItem', taskItem);
    fixture.componentRef.setInput('isDeleting', true);
    fixture.detectChanges();

    const actionsButton = fixture.nativeElement.querySelector(
      'button[aria-label="Actions for Prepare portfolio demo"]'
    ) as HTMLButtonElement;
    const dragHandle = fixture.nativeElement.querySelector('[cdkDragHandle]') as HTMLButtonElement;

    expect(actionsButton.disabled).toBeTrue();
    expect(dragHandle.disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Deleting task');
  });
});
