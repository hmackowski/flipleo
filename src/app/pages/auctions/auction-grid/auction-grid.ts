import { Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { Auction } from '@app/shared/models';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { AuctionCreateDialog } from '../auction-create-dialog/auction-create-dialog';
import { AuctionCards } from '../auction-cards/auction-cards';
import { getCountdown, isAuctionEnded, isEndingWithin24Hours, isEndingWithin3Hours } from '../auction-time.utils';

type AuctionFilter = 'all' | 'active' | 'ending-soon' | 'ended';

type ViewMode = 'table' | 'cards';
const VIEW_MODE_KEY = 'flipleo_auctions_view';

@Component({
  selector: 'app-auction-grid',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatButton,
    MatRow,
    MatRowDef,
    MatTable,
    MatButtonToggle,
    MatButtonToggleGroup,
    AuctionCards
  ],
  templateUrl: './auction-grid.html',
  styleUrl: './auction-grid.scss',
})
export class AuctionGrid {
  auctions = input.required<Auction[]>();

  deleteAuction = output<number>();
  openLink = output<string>();
  editAuction = output<Auction>();
  addAuction = output<void>();
  createFlip = output<Auction>();
  displayedColumns = ['item', 'auction_site', 'currentPrice', 'countdown', 'actions'];

  // ---------- Filters (chips + search) ----------
  readonly filterOptions: { value: AuctionFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'ending-soon', label: 'Ending in 24h' },
    { value: 'ended', label: 'Ended' },
  ];
  filter = signal<AuctionFilter>('all');
  search = signal('');

  filteredAuctions = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.auctions().filter((a) =>
      this.matchesFilter(a, this.filter()) &&
      (!term || a.name.toLowerCase().includes(term) || (a.notes ?? '').toLowerCase().includes(term))
    );
  });

  countFor(filter: AuctionFilter): number {
    return this.auctions().filter((a) => this.matchesFilter(a, filter)).length;
  }

  private matchesFilter(auction: Auction, filter: AuctionFilter): boolean {
    switch (filter) {
      case 'active': return !isAuctionEnded(auction.endTime);
      case 'ending-soon': return isEndingWithin24Hours(auction.endTime);
      case 'ended': return isAuctionEnded(auction.endTime);
      default: return true;
    }
  }


  // Table or card view (remembered in this browser, it's just a display preference)
  viewMode = signal<ViewMode>(loadViewMode());

  // Auctions whose image link failed to load, so we show the placeholder instead
  brokenImageIds = new Set<number>();

  constructor(private dialog: MatDialog) {}

  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      // storage unavailable (private mode etc.): the choice just won't be remembered
    }
  }

  hasImage(auction: Auction): boolean {
    return !!auction.imageUrl && !this.brokenImageIds.has(auction.id);
  }

  onImageError(auction: Auction) {
    this.brokenImageIds.add(auction.id);
  }

  onDeleteAuction(id: number) {
    this.deleteAuction.emit(id);
  }

  onEditAuction(auction: Auction) {
    const ref = this.dialog.open(AuctionCreateDialog, {
      width: '800px',
      maxWidth: '95vw',
      autoFocus: false,
      data: auction,
    });

    ref.afterClosed().subscribe((data?: Auction) => {
      if (!data) return;
      this.editAuction.emit(data);
    });
  }

  onOpenLink(link: string) {
    this.openLink.emit(link);
  }

  // Countdown helpers (shared with the card view)
  getCountdown = getCountdown;
  isEndingWithin3Hours = isEndingWithin3Hours;
  isAuctionEnded = isAuctionEnded;
}

function loadViewMode(): ViewMode {
  try {
    return localStorage.getItem(VIEW_MODE_KEY) === 'table' ? 'table' : 'cards';
  } catch {
    return 'cards';
  }
}
