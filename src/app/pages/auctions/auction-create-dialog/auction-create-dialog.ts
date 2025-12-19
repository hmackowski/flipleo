import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { Auction } from '../../../models/auction.model';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'app-auction-create-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIcon,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatPrefix
  ],
  templateUrl: './auction-create-dialog.html',
  styleUrls: ['./auction-create-dialog.scss'],
})
export class AuctionCreateDialog {
  private dialogRef = inject(MatDialogRef<AuctionCreateDialog>);

  itemName = signal('');
  currentPrice = signal<number | null>(null);
  auctionLink = signal('');
  endTime = signal('');
  notes = signal('');

  isFormValid(): boolean {
    return this.itemName().trim() !== '' &&
      this.currentPrice() !== null &&
      this.auctionLink().trim() !== '' &&
      this.endTime().trim() !== '';
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if (!this.isFormValid()) return;

    const result: Omit<Auction, 'id'> = {
      name: this.itemName(),
      startTime: new Date(),
      currentPrice: this.currentPrice() || 0,
      link: this.auctionLink(),
      endTime: new Date(this.endTime()),
      notes: this.notes().trim() ? this.notes() : undefined,
    };

    this.dialogRef.close(result);
  }
}
