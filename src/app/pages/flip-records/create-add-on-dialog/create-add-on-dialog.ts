import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatDialogRef} from '@angular/material/dialog';
import {MatFormField} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-create-add-on-dialog',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon,
  ],
  templateUrl: './create-add-on-dialog.html',
  styleUrl: './create-add-on-dialog.scss',
})

export class CreateAddOnDialog {

  addOnName = signal('');
  addOnPrice = signal<number | null>(null);
  addOnLink = signal('');
  private dialogRef = inject(MatDialogRef<CreateAddOnDialog>);


  isFormValid(): boolean {
    return true; // override per dialog
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close();
  }
}
