import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

import { FlipRecordAddOn } from '@app/shared/models';

@Component({
  selector: 'app-create-add-on-dialog',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatPrefix,
    MatIcon,
  ],
  templateUrl: './create-add-on-dialog.html',
  styleUrl: './create-add-on-dialog.scss',
})
export class CreateAddOnDialog {
  private dialogRef = inject(MatDialogRef<CreateAddOnDialog, FlipRecordAddOn>);

  addOnName = signal('');
  addOnPrice = signal<number | null>(null);
  addOnLink = signal('');

  isFormValid(): boolean {
    return this.addOnName().trim() !== '' &&
      this.addOnPrice() !== null &&
      (this.addOnPrice() ?? 0) >= 0;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (!this.isFormValid()) return;

    // The caller decides whether to queue it (new flip) or save it right away (existing flip)
    this.dialogRef.close({
      name: this.addOnName().trim(),
      price: this.addOnPrice() ?? 0,
      link: this.addOnLink().trim() || null,
    });
  }
}
