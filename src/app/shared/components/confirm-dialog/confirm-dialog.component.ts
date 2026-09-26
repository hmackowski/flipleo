import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string; // default "Delete"
  cancelText?: string;  // default "Cancel"
}

/** Simple "Are you sure?" dialog. Closes with true when confirmed. Open it through ConfirmDialogService. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButton, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">{{ data.cancelText ?? 'Cancel' }}</button>
      <button mat-flat-button type="button" class="confirm-button" [mat-dialog-close]="true" cdkFocusInitial>
        {{ data.confirmText ?? 'Delete' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .message { margin: 0; color: #555; line-height: 1.5; }
    .confirm-button { background-color: #d32f2f; color: #fff; }
  `,
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
