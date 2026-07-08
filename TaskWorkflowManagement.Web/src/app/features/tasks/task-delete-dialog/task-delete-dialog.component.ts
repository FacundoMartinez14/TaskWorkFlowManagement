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
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  template: `
    <h2 mat-dialog-title>Delete task?</h2>
    <mat-dialog-content>
      <p>“{{ data.title }}” will be removed from the board.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button class="delete-confirm-button" [mat-dialog-close]="true">Delete task</button>
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
