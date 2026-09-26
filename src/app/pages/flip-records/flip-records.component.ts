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

import { Observable, forkJoin, map, of } from 'rxjs';

import { AddOnPresetDataService, FlipRecordDataService } from '@app/core/services/data';
import { AddOnPreset, FlipRecord, FlipRecordAddOn } from '@app/shared/models';
import { CreateAddOnDialog, CreateAddOnResult } from './create-add-on-dialog/create-add-on-dialog';
import { SelectAddOnsDialog } from './select-add-ons-dialog/select-add-ons-dialog';

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
  displayedColumns = ['expand', 'date', 'itemName', 'buyPrice', 'partsPrice', 'sellPrice', 'profit', 'actions'];

  // Which flip's add-ons are showing (one at a time)
  expandedRecordId = signal<number | null>(null);

  constructor(
    private flipRecordDataService: FlipRecordDataService,
    private addOnPresetDataService: AddOnPresetDataService,
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

  toggleExpanded(record: FlipRecord) {
    this.expandedRecordId.update((id) => (id === record.id ? null : record.id ?? null));
  }

  isExpanded(record: FlipRecord): boolean {
    return this.expandedRecordId() === record.id;
  }

  deleteAddOn(addOnId: number) {
    this.flipRecordDataService
      .deleteAddOn(addOnId)
      .subscribe(() => this.loadRecords());
  }

  openLink(link: string) {
    window.open(link, '_blank');
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

  /** "Add-Ons" on the new flip: pick saved add-ons, then they're queued until the flip is saved. */
  openSelectAddOnsForNewFlip() {
    this.openSelectAddOnsDialog().subscribe((presets) => {
      if (!presets?.length) return;
      this.pendingAddOns.update((addOns) => [...addOns, ...presets.map(fromPreset)]);
    });
  }

  /** "Add-Ons" inside an expanded flip: pick saved add-ons and save them to that flip right away. */
  openSelectAddOnsForRecord(record: FlipRecord) {
    const recordId = record.id;
    if (recordId == null) return;

    this.openSelectAddOnsDialog().subscribe((presets) => {
      if (!presets?.length) return;
      forkJoin(presets.map((preset) => this.flipRecordDataService.addAddOn(recordId, fromPreset(preset))))
        .subscribe(() => this.loadRecords());
    });
  }

  private openSelectAddOnsDialog(): Observable<AddOnPreset[] | undefined> {
    return this.dialog
      .open<SelectAddOnsDialog, void, AddOnPreset[]>(SelectAddOnsDialog, { width: '640px', maxWidth: '95vw', autoFocus: false })
      .afterClosed();
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
        .subscribe(() => {
          this.expandedRecordId.set(record.id ?? null); // show the new add-on
          this.loadRecords();
        });
    });
  }

  /**
   * Opens the one-off Add-On dialog. If "Save as a preset" was ticked, the preset is created first
   * and the returned add-on is linked to it.
   */
  private openAddOnDialog(): Observable<FlipRecordAddOn | undefined> {
    return new Observable<FlipRecordAddOn | undefined>((subscriber) => {
      this.dialog
        .open<CreateAddOnDialog, void, CreateAddOnResult>(CreateAddOnDialog, { width: '800px', maxWidth: '95vw', autoFocus: false })
        .afterClosed()
        .subscribe((result) => {
          this.saveAsPresetIfRequested(result).subscribe((addOn) => {
            subscriber.next(addOn);
            subscriber.complete();
          });
        });
    });
  }

  private saveAsPresetIfRequested(result?: CreateAddOnResult): Observable<FlipRecordAddOn | undefined> {
    if (!result) return of(undefined);

    const { saveAsPreset, ...addOn } = result;
    if (!saveAsPreset) return of(addOn);

    return this.addOnPresetDataService
      .addAddOnPreset({ name: addOn.name, defaultPrice: addOn.price, link: addOn.link, imageUrl: addOn.imageUrl })
      .pipe(
        map((preset) => ({ ...addOn, addOnPresetId: preset.id ?? null }))
      );
  }

  private resetForm() {
    this.itemName.set('');
    this.buyPrice.set(null);
    this.sellPrice.set(null);
    this.pendingAddOns.set([]);
  }
}

/** A preset becomes a flip add-on by copying its values (so later preset edits don't change past flips). */
function fromPreset(preset: AddOnPreset): FlipRecordAddOn {
  return {
    addOnPresetId: preset.id ?? null,
    name: preset.name,
    price: preset.defaultPrice,
    link: preset.link ?? null,
    imageUrl: preset.imageUrl ?? null,
  };
}

/** yyyy-MM-dd in local time, so the API stores the date you actually see. */
function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
