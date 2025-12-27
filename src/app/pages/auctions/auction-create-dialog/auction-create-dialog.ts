import {Component, Inject, inject, OnInit, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { Auction } from '../../../models/auction.model';
import {NgForOf} from '@angular/common';
import {MatOption, MatSelect} from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSuffix } from '@angular/material/form-field';
import {StorageService} from 'app/services/storage.service';



@Component({
  selector: 'app-auction-create-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatPrefix,
    MatSelect,
    MatOption,
    NgForOf,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSuffix
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './auction-create-dialog.html',
  styleUrls: ['./auction-create-dialog.scss'],
})
export class AuctionCreateDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<AuctionCreateDialog>);


  itemName = signal('');
  currentPrice = signal<number | null>(null);
  auctionLink = signal('');
  endTime = signal<Date | null>(null);
  endTimeStr = signal('');
  notes = signal('');
  auctionSite = signal('');
  auctionSites = ['eBay', 'Goodwill']
  saveText = 'Track Auction'
  isEdit: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Auction,
              private storageService: StorageService) {}

  ngOnInit() {
    if(this.data){
      this.isEdit = true;
      this.setFormData();
    }
  }

  setFormData() {
    {
      this.saveText = 'Update Auction'
      this.itemName.set(this.data.name);
      this.currentPrice.set(this.data.currentPrice);
      this.auctionLink.set(this.data.link);
      const endDate = new Date(this.data.endTime);
      this.endTime.set(endDate);
      this.endTimeStr.set(endDate.toTimeString().slice(0, 5));
      this.notes.set(this.data.notes || '');
      this.auctionSite.set(this.data.auctionSite);
    }
  }

  isFormValid(): boolean {
    return this.itemName().trim() !== '' &&
      this.currentPrice() !== null &&
      this.auctionLink().trim() !== '' &&
      this.endTime() !== null &&
      this.endTimeStr().trim() !== '';
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if (!this.isFormValid()) return;

    const endDateTime = new Date(this.endTime() || new Date());
    const [hours, minutes] = this.endTimeStr().split(':');
    endDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const result: Auction = {
      id: this.data?.id || 0,
      name: this.itemName(),
      startTime: this.data?.startTime || new Date(),
      currentPrice: this.currentPrice() || 0,
      link: this.auctionLink(),
      auctionSite: this.auctionSite(),
      endTime: endDateTime,
      notes: this.notes().trim() ? this.notes() : undefined,
    };

    if(this.isEdit)
    {
      this.storageService.editAuction(result);
      this.dialogRef.close();
    }

    this.dialogRef.close(result);
  }
}
