import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';

import { AddOnPresetDataService, LookupDataService } from '@app/core/services/data';
import { AddOnPreset, FlipRecord, FlipRecordAddOn, FlipStatus, FlipStatusIds } from '@app/shared/models';
import { ImageLinkFieldComponent } from '@app/shared/components/image-link-field/image-link-field.component';
import { fromPreset } from '../add-on.utils';
import { CreateAddOnDialog, CreateAddOnResult } from '../create-add-on-dialog/create-add-on-dialog';
import { SelectAddOnsDialog } from '../select-add-ons-dialog/select-add-ons-dialog';

/**
 * Add or edit a flip: item, image, status, prices, dates AND its add-ons (add from saved add-ons, add a
 * one-off, change a price, or remove). Open with no data to add a new flip, pass a flip (with an id)
 * to edit it, or pass a partial flip without an id to start a new one pre-filled (e.g. from an auction).
 * Nothing is saved here; the dialog returns the whole flip (with its full add-on list) and the page
 * sends it to the API in one request.
 */
@Component({
  selector: 'app-edit-flip-record-dialog',
  imports: [
    CurrencyPipe,
    FormsModule,
    MatButton,
    MatIconButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatIcon,
    MatDatepickerModule,
    MatButtonToggleModule,
    ImageLinkFieldComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-flip-record-dialog.html',
  styleUrl: './edit-flip-record-dialog.scss',
})
export class EditFlipRecordDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<EditFlipRecordDialog, FlipRecord>);
  private dialog = inject(MatDialog);
  private addOnPresetDataService = inject(AddOnPresetDataService);
  private lookupDataService = inject(LookupDataService);
  private data = inject<Partial<FlipRecord> | null>(MAT_DIALOG_DATA, { optional: true });

  isEdit = this.data?.id != null;

  // Shown until the lookup loads, so the toggle never flashes empty
  statuses = signal<FlipStatus[]>([
    { id: FlipStatusIds.Bought, name: 'Bought' },
    { id: FlipStatusIds.Listed, name: 'Listed' },
    { id: FlipStatusIds.Sold, name: 'Sold' },
  ]);
  flipStatusId = signal<number>(this.data?.flipStatusId ?? FlipStatusIds.Bought);
  soldDate = signal<Date | null>(this.data?.soldDate ? parseDateOnly(this.data.soldDate) : null);
  isSold = computed(() => this.flipStatusId() === FlipStatusIds.Sold);
  sellPriceLabel = computed(() => {
    if (this.isSold()) return 'Sell Price';
    return this.flipStatusId() === FlipStatusIds.Listed ? 'Asking Price (Optional)' : 'Sell Price (Optional)';
  });

  itemName = signal(this.data?.itemName ?? '');
  imageUrl = signal(this.data?.imageUrl ?? '');
  buyPrice = signal<number | null>(this.data?.buyPrice ?? null);
  sellPrice = signal<number | null>(this.data?.sellPrice ?? null);
  flipDate = signal<Date | null>(this.data?.flipDate ? parseDateOnly(this.data.flipDate) : new Date());

  // Working copy of the add-ons (copied so Cancel throws the changes away)
  addOns = signal<FlipRecordAddOn[]>((this.data?.addOns ?? []).map((a) => ({ ...a })));

  partsPrice = computed(() => this.addOns().reduce((sum, a) => sum + (Number(a.price) || 0), 0));
  /** Real profit once Sold; "expected" while there's an asking price; null when there's no price yet. */
  profit = computed<{ value: number } | null>(() => {
    const sellPrice = this.sellPrice();
    if (sellPrice === null || sellPrice === undefined || (sellPrice as unknown) === '') return null;
    return { value: Number(sellPrice) - (this.buyPrice() ?? 0) - this.partsPrice() };
  });

  ngOnInit() {
    this.lookupDataService.getFlipStatuses().subscribe((statuses) => {
      if (statuses.length) this.statuses.set(statuses);
    });
  }

  setStatus(statusId: number) {
    this.flipStatusId.set(statusId);
    // Marking it sold: default the sold date to today
    if (statusId === FlipStatusIds.Sold && !this.soldDate()) this.soldDate.set(new Date());
  }

  isFormValid(): boolean {
    const addOnsValid = this.addOns().every((a) => a.name.trim() !== '' && a.price !== null && a.price >= 0);
    const sellPrice = this.sellPrice();
    const sellPriceValid = sellPrice === null ? !this.isSold() : sellPrice >= 0;
    const soldDateValid = !this.isSold() ||
      (this.soldDate() !== null && this.flipDate() !== null && this.soldDate()! >= this.flipDate()!);

    return this.itemName().trim() !== '' &&
      this.buyPrice() !== null && (this.buyPrice() ?? 0) >= 0 &&
      sellPriceValid &&
      this.flipDate() !== null &&
      soldDateValid &&
      addOnsValid;
  }

  updateAddOnPrice(index: number, price: number) {
    this.addOns.update((addOns) => addOns.map((a, i) => (i === index ? { ...a, price } : a)));
  }

  removeAddOn(index: number) {
    this.addOns.update((addOns) => addOns.filter((_, i) => i !== index));
  }

  /** Pick from the user's saved add-ons. */
  openSelectAddOns() {
    this.dialog
      .open<SelectAddOnsDialog, void, AddOnPreset[]>(SelectAddOnsDialog, { width: '640px', maxWidth: '95vw', autoFocus: false })
      .afterClosed()
      .subscribe((presets) => {
        if (!presets?.length) return;
        this.addOns.update((addOns) => [...addOns, ...presets.map(fromPreset)]);
      });
  }

  /** Type in a one-off add-on (optionally also saving it to My Add-Ons). */
  openOneOffAddOn() {
    this.dialog
      .open<CreateAddOnDialog, void, CreateAddOnResult>(CreateAddOnDialog, { width: '800px', maxWidth: '95vw', autoFocus: false })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        const { saveAsPreset, ...addOn } = result;

        if (!saveAsPreset) {
          this.addOns.update((addOns) => [...addOns, addOn]);
          return;
        }

        this.addOnPresetDataService
          .addAddOnPreset({ name: addOn.name, defaultPrice: addOn.price, link: addOn.link, imageUrl: addOn.imageUrl })
          .subscribe((preset) =>
            this.addOns.update((addOns) => [...addOns, { ...addOn, addOnPresetId: preset.id ?? null }]));
      });
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if (!this.isFormValid()) return;

    const sellPrice = this.sellPrice();

    this.dialogRef.close({
      ...this.data, // keeps id (when editing) + auctionId
      itemName: this.itemName().trim(),
      imageUrl: this.imageUrl().trim() || null,
      buyPrice: this.buyPrice() ?? 0,
      sellPrice: sellPrice === null || (sellPrice as unknown) === '' ? null : Number(sellPrice),
      flipDate: toDateString(this.flipDate()!),
      flipStatusId: this.flipStatusId(),
      soldDate: this.isSold() ? toDateString(this.soldDate()!) : null,
      // Full list: the API removes missing ones, updates existing ones, adds new ones (no id)
      addOns: this.addOns().map((a) => ({ ...a, id: a.id ?? 0, price: Number(a.price) || 0 })),
    });
  }
}

/** "2026-09-26" or "2026-09-26T00:00:00" -> local-midnight Date (avoids the UTC off-by-one-day shift). */
function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  return match ? new Date(+match[1], +match[2] - 1, +match[3]) : null;
}

/** yyyy-MM-dd in local time, so the API stores the date you actually picked. */
function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
