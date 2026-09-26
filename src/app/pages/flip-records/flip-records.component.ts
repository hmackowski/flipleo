import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { FlipRecordDataService } from '@app/core/services/data';
import { FlipRecord, FlipRecordAddOn } from '@app/shared/models';
import { CreateAddOnDialog } from './create-add-on-dialog/create-add-on-dialog';

@Component({
  selector: 'app-flip-records',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './flip-records.component.html',
  styleUrl: './flip-records.component.scss'
})
export class FlipRecords implements OnInit {
  // Form fields
  itemName = signal('');
  buyPrice = signal<number | null>(null);
  sellPrice = signal<number | null>(null);

  // Add-ons for the flip being created (saved together with it)
  pendingAddOns = signal<FlipRecordAddOn[]>([]);
  pendingPartsPrice = computed(() =>
    this.pendingAddOns().reduce((sum, addOn) => sum + addOn.price, 0)
  );

  // Records
  records = signal<FlipRecord[]>([]);
  totalProfit = computed(() =>
    this.records().reduce((sum, record) => sum + (record.profit ?? 0), 0)
  );

  // Table columns
  displayedColumns = ['date', 'itemName', 'buyPrice', 'partsPrice', 'sellPrice', 'profit', 'actions'];

  constructor(
    private flipRecordDataService: FlipRecordDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.flipRecordDataService
      .getFlipRecords()
      .subscribe((records) => this.records.set(records));
  }

  addRecord() {
    if (!this.isFormValid()) return;

    const newRecord: FlipRecord = {
      itemName: this.itemName().trim(),
      buyPrice: this.buyPrice() ?? 0,
      sellPrice: this.sellPrice() ?? 0,
      flipDate: toDateString(new Date()),
      auctionId: null,
      addOns: this.pendingAddOns(),
    };

    this.flipRecordDataService.addFlipRecord(newRecord).subscribe(() => {
      this.resetForm();
      this.loadRecords();
    });
  }

  deleteRecord(id: number) {
    this.flipRecordDataService
      .deleteFlipRecord(id)
      .subscribe(() => this.loadRecords());
  }

  isFormValid(): boolean {
    return this.itemName().trim() !== '' &&
           this.buyPrice() !== null &&
           this.sellPrice() !== null;
  }

  /** Add-On button on the "Add New Flip" form: queue it until the flip is saved. */
  openCreateAddOnDialog() {
    this.openAddOnDialog().subscribe((addOn) => {
      if (!addOn) return;
      this.pendingAddOns.update((addOns) => [...addOns, addOn]);
    });
  }

  removePendingAddOn(index: number) {
    this.pendingAddOns.update((addOns) => addOns.filter((_, i) => i !== index));
  }

  /** Add-On button on an existing row: save it straight to the API. */
  addAddOnToRecord(record: FlipRecord) {
    this.openAddOnDialog().subscribe((addOn) => {
      if (!addOn || record.id == null) return;

      this.flipRecordDataService
        .addAddOn(record.id, addOn)
        .subscribe(() => this.loadRecords());
    });
  }

  private openAddOnDialog() {
    return this.dialog
      .open<CreateAddOnDialog, void, FlipRecordAddOn>(CreateAddOnDialog, { width: '800px', maxWidth: '95vw', autoFocus: false })
      .afterClosed();
  }

  private resetForm() {
    this.itemName.set('');
    this.buyPrice.set(null);
    this.sellPrice.set(null);
    this.pendingAddOns.set([]);
  }
}

/** yyyy-MM-dd in local time, so the API stores the date you actually see. */
function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
