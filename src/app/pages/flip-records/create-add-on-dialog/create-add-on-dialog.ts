import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-create-add-on-dialog',
  imports: [
    FormsModule,
    MatButton,

  ],
  templateUrl: './create-add-on-dialog.html',
  styleUrl: './create-add-on-dialog.scss',
})
export class CreateAddOnDialog {
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
