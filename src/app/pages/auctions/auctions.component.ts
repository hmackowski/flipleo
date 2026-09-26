import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { Auction } from '@app/shared/models';
import { AuctionDataService } from '@app/core/services/data';
import { AuctionGrid } from './auction-grid/auction-grid';
import { AuctionCreateDialog } from './auction-create-dialog/auction-create-dialog';

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    AuctionGrid
  ],
  templateUrl: './auctions.component.html',
  styleUrl: './auctions.component.scss',
})
export class AuctionsComponent implements OnInit, OnDestroy {
  auctions = signal<Auction[]>([]);

  private countdownInterval?: ReturnType<typeof setInterval>;

  constructor(
    private auctionDataService: AuctionDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadAuctions();

    // Re-render every second so the countdowns tick
    this.countdownInterval = setInterval(() => {
      this.auctions.set([...this.auctions()]);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  loadAuctions() {
    this.auctionDataService
      .getAuctions()
      .subscribe((auctions) => this.auctions.set(auctions));
  }

  openCreateAuctionDialog() {
    const ref = this.dialog.open(AuctionCreateDialog, {
      width: '800px',
      maxWidth: '95vw',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((auction?: Auction) => {
      if (!auction) return;

      this.auctionDataService
        .addAuction(auction)
        .subscribe(() => this.loadAuctions());
    });
  }

  deleteAuction(id: number) {
    this.auctionDataService
      .deleteAuction(id)
      .subscribe(() => this.loadAuctions());
  }

  editAuction(updatedAuction: Auction) {
    this.auctionDataService
      .updateAuction(updatedAuction)
      .subscribe(() => this.loadAuctions());
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }
}
