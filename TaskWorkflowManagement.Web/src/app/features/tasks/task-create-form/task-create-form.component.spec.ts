import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Subject, of } from 'rxjs';

import { TaskItem } from '../../../models/task-item';
import { TaskItemStatus } from '../../../models/task-item-status';
import { TaskItemsService } from '../../../services/task-items.service';
import { TaskCreateFormComponent } from './task-create-form.component';

describe('TaskCreateFormComponent', () => {
  const createdTaskItem: TaskItem = {
    id: 'task-2',
    title: 'Document keyboard flow',
    description: null,
    status: TaskItemStatus.ToDo,
    createdAtUtc: '2026-07-26T12:00:00Z'
  };
  let dialogRef: { disableClose: boolean; close: jasmine.Spy };
  let taskItemsService: jasmine.SpyObj<TaskItemsService>;

  beforeEach(async () => {
    dialogRef = { disableClose: false, close: jasmine.createSpy('close') };
    taskItemsService = jasmine.createSpyObj<TaskItemsService>('TaskItemsService', [
      'createTaskItem'
    ]);

    await TestBed.configureTestingModule({
      imports: [TaskCreateFormComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: TaskItemsService, useValue: taskItemsService }
      ]
    }).compileComponents();
  });

  it('marks a whitespace-only title invalid and keeps the title as the initial focus target', () => {
    const fixture = createComponent();
    const formAccess = componentAccess(fixture);

    formAccess.taskForm.controls.title.setValue('   ');
    formAccess.submit();
    fixture.detectChanges();

    expect(formAccess.taskForm.controls.title.hasError('pattern')).toBeTrue();
    expect(taskItemsService.createTaskItem).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#task-create-title')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Title cannot be only whitespace.');
  });

  it('rejects a title longer than 200 characters', () => {
    const fixture = createComponent();
    const formAccess = componentAccess(fixture);

    formAccess.taskForm.controls.title.setValue('x'.repeat(201));
    formAccess.submit();

    expect(formAccess.taskForm.controls.title.hasError('maxlength')).toBeTrue();
    expect(taskItemsService.createTaskItem).not.toHaveBeenCalled();
  });

  it('blocks duplicate submission and prevents dismissal while the request is pending', () => {
    const createRequest = new Subject<TaskItem>();
    taskItemsService.createTaskItem.and.returnValue(createRequest.asObservable());
    const fixture = createComponent();
    const formAccess = componentAccess(fixture);
    formAccess.taskForm.setValue({ title: createdTaskItem.title, description: '' });

    formAccess.submit();
    formAccess.submit();
    formAccess.cancel();

    expect(taskItemsService.createTaskItem).toHaveBeenCalledTimes(1);
    expect(dialogRef.disableClose).toBeTrue();
    expect(formAccess.taskForm.disabled).toBeTrue();
    expect(dialogRef.close).not.toHaveBeenCalled();

    createRequest.error(new Error('offline'));
    fixture.detectChanges();

    expect(dialogRef.disableClose).toBeFalse();
    expect(formAccess.taskForm.enabled).toBeTrue();
    expect(formAccess.errorMessage()).toContain('Unable to create');
  });

  it('closes with the returned task after a successful request', () => {
    taskItemsService.createTaskItem.and.returnValue(of(createdTaskItem));
    const fixture = createComponent();
    const formAccess = componentAccess(fixture);
    formAccess.taskForm.setValue({ title: ` ${createdTaskItem.title} `, description: ' ' });

    formAccess.submit();

    expect(taskItemsService.createTaskItem).toHaveBeenCalledOnceWith({
      title: createdTaskItem.title,
      description: null
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(createdTaskItem);
  });

  function createComponent(): ComponentFixture<TaskCreateFormComponent> {
    const fixture = TestBed.createComponent(TaskCreateFormComponent);
    fixture.detectChanges();
    return fixture;
  }
});

function componentAccess(fixture: ComponentFixture<TaskCreateFormComponent>): {
  taskForm: TaskCreateFormComponent['taskForm'];
  errorMessage: TaskCreateFormComponent['errorMessage'];
  cancel(): void;
  submit(): void;
} {
  return fixture.componentInstance as unknown as {
    taskForm: TaskCreateFormComponent['taskForm'];
    errorMessage: TaskCreateFormComponent['errorMessage'];
    cancel(): void;
    submit(): void;
  };
}
