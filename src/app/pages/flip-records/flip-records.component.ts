import { Component, computed, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Observable, forkJoin, map, of } from 'rxjs';

import { AddOnPresetDataService, FlipRecordDataService } from '@app/core/services/data';
import { AddOnPreset, FlipRecord, FlipRecordAddOn, FlipStatusIds } from '@app/shared/models';
import { ConfirmDialogService } from '@app/core/services/confirm-dialog.service';
import { CreateAddOnDialog, CreateAddOnResult } from './create-add-on-dialog/create-add-on-dialog';
import { SelectAddOnsDialog } from './select-add-ons-dialog/select-add-ons-dialog';
import { EditFlipRecordDialog } from './edit-flip-record-dialog/edit-flip-record-dialog';
import { fromPreset } from './add-on.utils';
import { FlipRecordCards } from './flip-record-cards/flip-record-cards';
import { StatTileComponent } from '@app/shared/components/stat-tile/stat-tile.component';

type ViewMode = 'table' | 'cards';
const VIEW_MODE_KEY = 'flipleo_flips_view';

@Component({
  selector: 'app-flip-records',
  imports: [
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    MatButtonToggleModule,
    FlipRecordCards,
    StatTileComponent
  ],
  templateUrl: './flip-records.component.html',
  styleUrl: './flip-records.component.scss'
})
export class FlipRecords implements OnInit {
  // Records
  records = signal<FlipRecord[]>([]);
  // Profit only counts sold flips (profit is null until then)
  totalProfit = computed(() =>
    this.records().reduce((sum, record) => sum + (record.profit ?? 0), 0)
  );

  // Items bought but not sold yet, and what's tied up in them (buy + parts)
  private unsoldRecords = computed(() => this.records().filter((r) => r.flipStatusId !== FlipStatusIds.Sold));
  unsoldCount = computed(() => this.unsoldRecords().length);
  unsoldCost = computed(() =>
    this.unsoldRecords().reduce((sum, r) => sum + r.buyPrice + (r.partsPrice ?? 0), 0)
  );

  readonly FlipStatusIds = FlipStatusIds;

  // ---------- Summary tiles ----------
  private soldRecords = computed(() => this.records().filter((r) => r.flipStatusId === FlipStatusIds.Sold));
  soldCount = computed(() => this.soldRecords().length);

  /** Overall ROI on sold flips: total profit / total cost (buy + parts). */
  averageRoi = computed<number | null>(() => {
    const sold = this.soldRecords();
    const cost = sold.reduce((sum, r) => sum + r.buyPrice + (r.partsPrice ?? 0), 0);
    return sold.length && cost > 0 ? this.totalProfit() / cost : null;
  });

  // ---------- Filters (status chips + search) ----------
  readonly statusFilters = [
    { id: FlipStatusIds.Bought, name: 'Bought' },
    { id: FlipStatusIds.Listed, name: 'Listed' },
    { id: FlipStatusIds.Sold, name: 'Sold' },
  ];
  statusFilter = signal<'all' | number>('all');
  search = signal('');

  filteredRecords = computed(() => {
    const status = this.statusFilter();
    const term = this.search().trim().toLowerCase();
    return this.records().filter((r) =>
      (status === 'all' || r.flipStatusId === status) &&
      (!term || r.itemName.toLowerCase().includes(term) || r.addOns.some((a) => a.name.toLowerCase().includes(term)))
    );
  });

  statusCount(statusId: number): number {
    return this.records().filter((r) => r.flipStatusId === statusId).length;
  }

  clearFilters() {
    this.statusFilter.set('all');
    this.search.set('');
  }

  // Table columns
  displayedColumns = ['expand', 'item', 'status', 'buyPrice', 'partsPrice', 'sellPrice', 'profit', 'actions'];

  // Table or card view (remembered in this browser, it's just a display preference)
  viewMode = signal<ViewMode>(loadViewMode());

  // Which flip's add-ons are showing (one at a time)
  expandedRecordId = signal<number | null>(null);

  constructor(
    private flipRecordDataService: FlipRecordDataService,
    private addOnPresetDataService: AddOnPresetDataService,
    private dialog: MatDialog,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.flipRecordDataService
      .getFlipRecords()
      .subscribe((records) => this.records.set(records));
  }

  /** "Add Flip" button: opens the flip dialog empty, then saves the new flip (with its add-ons). */
  openAddFlipDialog() {
    this.dialog
      .open<EditFlipRecordDialog, void, FlipRecord>(EditFlipRecordDialog, {
        width: '820px',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((newRecord) => {
        if (!newRecord) return;
        this.flipRecordDataService
          .addFlipRecord(newRecord)
          .subscribe(() => this.loadRecords());
      });
  }

  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      // storage unavailable (private mode etc.): the choice just won't be remembered
    }
  }

  toggleExpanded(record: FlipRecord) {
    this.expandedRecordId.update((id) => (id === record.id ? null : record.id ?? null));
  }

  isExpanded(record: FlipRecord): boolean {
    return this.expandedRecordId() === record.id;
  }

  deleteAddOn(addOn: FlipRecordAddOn) {
    const addOnId = addOn.id;
    if (addOnId == null) return;

    this.confirmDialog
      .confirm({ title: 'Remove add-on?', message: `Remove "${addOn.name}" from this flip?`, confirmText: 'Remove' })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.flipRecordDataService
          .deleteAddOn(addOnId)
          .subscribe(() => this.loadRecords());
      });
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }

  /** Edit button on a row or card: change the flip and its add-ons. */
  editRecord(record: FlipRecord) {
    this.dialog
      .open<EditFlipRecordDialog, FlipRecord, FlipRecord>(EditFlipRecordDialog, {
        width: '820px',
        maxWidth: '95vw',
        autoFocus: false,
        data: record,
      })
      .afterClosed()
      .subscribe((updated) => {
        if (!updated) return;
        this.flipRecordDataService
          .updateFlipRecord(updated)
          .subscribe(() => this.loadRecords());
      });
  }

  deleteRecord(record: FlipRecord) {
    const recordId = record.id;
    if (recordId == null) return;

    this.confirmDialog
      .confirm({
        title: 'Delete flip?',
        message: `"${record.itemName}" and its add-ons will be deleted. This can't be undone.`,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.flipRecordDataService
          .deleteFlipRecord(recordId)
          .subscribe(() => this.loadRecords());
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
}

function loadViewMode(): ViewMode {
  try {
    return localStorage.getItem(VIEW_MODE_KEY) === 'table' ? 'table' : 'cards';
  } catch {
    return 'cards';
  }
}
