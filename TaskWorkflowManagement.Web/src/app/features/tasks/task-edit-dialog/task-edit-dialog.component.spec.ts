import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

import { TaskItem } from '../../../models/task-item';
import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskItemsService } from '../../../services/task-items.service';
import { TaskEditDialogComponent } from './task-edit-dialog.component';

describe('TaskEditDialogComponent', () => {
  const taskItem: TaskItem = {
    id: 'task-1',
    title: 'Prepare portfolio demo',
    description: 'Check the board states.',
    status: TaskItemStatus.ToDo,
    createdAtUtc: '2026-07-26T12:00:00Z'
  };
  let dialogRef: { disableClose: boolean; close: jasmine.Spy };
  let taskItemsService: jasmine.SpyObj<TaskItemsService>;

  beforeEach(async () => {
    dialogRef = { disableClose: false, close: jasmine.createSpy('close') };
    taskItemsService = jasmine.createSpyObj<TaskItemsService>('TaskItemsService', [
      'updateTaskItem',
      'updateTaskItemStatus'
    ]);

    await TestBed.configureTestingModule({
      imports: [TaskEditDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: taskItem },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TaskItemsService, useValue: taskItemsService }
      ]
    }).compileComponents();
  });

  it('uses the title as the initial focus target and distinguishes whitespace validation', () => {
    const fixture = createComponent();
    const access = componentAccess(fixture);

    access.taskForm.controls.title.setValue('   ');
    access.taskForm.controls.title.markAsTouched();
    fixture.detectChanges();

    expect(access.taskForm.controls.title.hasError('pattern')).toBeTrue();
    expect(fixture.nativeElement.querySelector('#task-edit-title')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Title cannot be only whitespace.');
  });

  it('disables the form and prevents close while saving, then recovers after an error', () => {
    const updateRequest = new Subject<void>();
    taskItemsService.updateTaskItem.and.returnValue(updateRequest.asObservable());
    const fixture = createComponent();
    const access = componentAccess(fixture);
    access.taskForm.controls.title.setValue('Updated title');
    access.taskForm.markAsDirty();

    access.save();

    expect(dialogRef.disableClose).toBeTrue();
    expect(access.taskForm.disabled).toBeTrue();

    updateRequest.error(new Error('offline'));
    fixture.detectChanges();

    expect(dialogRef.disableClose).toBeFalse();
    expect(access.taskForm.enabled).toBeTrue();
    expect(access.errorMessage()).toContain('Unable to save');
  });

  function createComponent(): ComponentFixture<TaskEditDialogComponent> {
    const fixture = TestBed.createComponent(TaskEditDialogComponent);
    fixture.detectChanges();
    return fixture;
  }
});

function componentAccess(fixture: ComponentFixture<TaskEditDialogComponent>): {
  taskForm: any;
  errorMessage(): string | null;
  save(): void;
} {
  return fixture.componentInstance as unknown as {
    taskForm: any;
    errorMessage(): string | null;
    save(): void;
  };
}
