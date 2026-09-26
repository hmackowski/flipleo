import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSuffix } from '@angular/material/form-field';

import { LookupDataService } from '@app/core/services/data';
import { Auction, AuctionSite } from '@app/shared/models';

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
  private lookupDataService = inject(LookupDataService);

  // Present when editing an existing auction, null when creating
  data = inject<Auction | null>(MAT_DIALOG_DATA, { optional: true });

  itemName = signal('');
  currentPrice = signal<number | null>(null);
  auctionLink = signal('');
  endTime = signal<Date | null>(null);
  endTimeStr = signal('');
  notes = signal('');
  imageUrl = signal('');
  imagePreviewFailed = signal(false);
  auctionSiteId = signal<number | null>(null);
  auctionSites = signal<AuctionSite[]>([]);
  saveText = 'Track Auction';
  titleText = 'Track New Auction';
  isEdit = false;

  ngOnInit() {
    // Sites come from the LookupAuctionSite table instead of a hard-coded list
    this.lookupDataService
      .getAuctionSites()
      .subscribe((sites) => this.auctionSites.set(sites));

    if (this.data) {
      this.isEdit = true;
      this.setFormData(this.data);
    }
  }

  setFormData(auction: Auction) {
    this.saveText = 'Update Auction';
    this.titleText = 'Edit Auction';
    this.itemName.set(auction.name);
    this.currentPrice.set(auction.currentPrice);
    this.auctionLink.set(auction.link);
    const endDate = new Date(auction.endTime);
    this.endTime.set(endDate);
    this.endTimeStr.set(endDate.toTimeString().slice(0, 5));
    this.notes.set(auction.notes || '');
    this.imageUrl.set(auction.imageUrl || '');
    this.auctionSiteId.set(auction.auctionSiteId);
  }

  isFormValid(): boolean {
    return this.itemName().trim() !== '' &&
      this.currentPrice() !== null &&
      this.auctionSiteId() !== null &&
      this.auctionLink().trim() !== '' &&
      this.endTime() !== null &&
      this.endTimeStr().trim() !== '';
  }

  onImageUrlChange(value: string) {
    this.imageUrl.set(value);
    this.imagePreviewFailed.set(false); // try loading the preview again for the new link
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
      id: this.data?.id ?? 0,
      name: this.itemName().trim(),
      auctionSiteId: this.auctionSiteId()!,
      link: this.auctionLink().trim(),
      imageUrl: this.imageUrl().trim() || null,
      currentPrice: this.currentPrice() ?? 0,
      startTime: this.data?.startTime ?? new Date(),
      endTime: endDateTime,
      notes: this.notes().trim() ? this.notes().trim() : null,
    };

    // The parent component saves it through the API
    this.dialogRef.close(result);
  }
}
