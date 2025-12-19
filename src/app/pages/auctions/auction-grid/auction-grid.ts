import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
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
import { Auction } from '../../../models/auction.model';

@Component({
  selector: 'app-auction-grid',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButton,
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
    MatTable
  ],
  templateUrl: './auction-grid.html',
  styleUrl: './auction-grid.scss',
})
export class AuctionGrid {
  auctions = input.required<Auction[]>();

  deleteAuction = output<number>();
  openLink = output<string>();

  displayedColumns = ['name', 'currentPrice', 'startTime', 'countdown','auction_site', 'link', 'notes', 'actions'];

  onDeleteAuction(id: number) {
    this.deleteAuction.emit(id);
  }

  onOpenLink(link: string) {
    this.openLink.emit(link);
  }

  getCountdown(endTime: Date): string {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'ENDED';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }

  isEndingSameDay(endTime: Date): boolean {
    const now = new Date();
    const end = new Date(endTime);

    return now.getFullYear() === end.getFullYear() &&
      now.getMonth() === end.getMonth() &&
      now.getDate() === end.getDate() &&
      end > now;
  }

  isEndingWithin3Hours(endTime: Date): boolean {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    return diff > 0 && diff <= 3 * 60 * 60 * 1000;
  }

  isAuctionEnded(endTime: Date): boolean {
    return new Date(endTime) < new Date();
  }
}
