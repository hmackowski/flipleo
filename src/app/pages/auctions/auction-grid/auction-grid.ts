import { Component, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
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
import { getCountdown, isAuctionEnded, isEndingWithin3Hours } from '../auction-time.utils';

type ViewMode = 'table' | 'cards';
const VIEW_MODE_KEY = 'flipleo_auctions_view';

@Component({
  selector: 'app-auction-grid',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
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
  createFlip = output<Auction>();
  displayedColumns = ['image', 'name', 'currentPrice', 'startTime', 'countdown','auction_site', 'link', 'notes', 'actions'];


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
    return localStorage.getItem(VIEW_MODE_KEY) === 'cards' ? 'cards' : 'table';
  } catch {
    return 'table';
  }
}
