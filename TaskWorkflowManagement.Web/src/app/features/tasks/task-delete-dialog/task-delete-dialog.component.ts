import { A11yModule } from '@angular/cdk/a11y';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';

export interface TaskDeleteDialogData {
  title: string;
}

@Component({
  selector: 'app-task-delete-dialog',
  imports: [
    A11yModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  template: `
    <h2 mat-dialog-title>Delete “{{ data.title }}”?</h2>
    <mat-dialog-content>
      <p>This task will be removed from the board.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button cdkFocusInitial mat-button type="button" [mat-dialog-close]="false">Cancel</button>
      <button
        mat-flat-button
        type="button"
        class="delete-confirm-button"
        [mat-dialog-close]="true"
      >
        Delete task
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .delete-confirm-button {
      --mdc-filled-button-container-color: #b3261e;
      --mdc-filled-button-label-text-color: #ffffff;
      --mat-filled-button-state-layer-color: #ffffff;
      background-color: #b3261e;
      color: #ffffff;
    }

    .delete-confirm-button:hover {
      background-color: #8c1d18;
    }
  `
})
export class TaskDeleteDialogComponent {
  protected readonly data = inject<TaskDeleteDialogData>(MAT_DIALOG_DATA);
}
