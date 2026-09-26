import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Auction, FlipRecord, FlipStatusIds } from '@app/shared/models';
import { AuctionDataService, FlipRecordDataService, LookupDataService } from '@app/core/services/data';
import { ConfirmDialogService } from '@app/core/services/confirm-dialog.service';
import { EditFlipRecordDialog } from '../flip-records/edit-flip-record-dialog/edit-flip-record-dialog';
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
    public lookUpDataService: LookupDataService,
    private flipRecordDataService: FlipRecordDataService,
    private confirmDialog: ConfirmDialogService,
    private snackBar: MatSnackBar,
    private router: Router,
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
    const auction = this.auctions().find((a) => a.id === id);

    this.confirmDialog
      .confirm({
        title: 'Delete auction?',
        message: `Stop tracking "${auction?.name ?? 'this auction'}"? This can't be undone.`,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.auctionDataService
          .deleteAuction(id)
          .subscribe(() => this.loadAuctions());
      });
  }

  /**
   * "Won it": opens the flip dialog pre-filled from the auction (name, image, price paid)
   * and linked to it with auctionId. Nothing is saved unless they click Add Flip.
   */
  createFlipFromAuction(auction: Auction) {
    // Bought on the day it ended (or today, if it hasn't ended yet)
    const endTime = new Date(auction.endTime);
    const boughtDate = endTime < new Date() ? endTime : new Date();

    const prefill: Partial<FlipRecord> = {
      itemName: auction.name,
      imageUrl: auction.imageUrl ?? null,
      buyPrice: auction.currentPrice,
      flipDate: toDateString(boughtDate),
      flipStatusId: FlipStatusIds.Bought,
      auctionId: auction.id,
      addOns: [],
    };

    this.dialog
      .open<EditFlipRecordDialog, Partial<FlipRecord>, FlipRecord>(EditFlipRecordDialog, {
        width: '820px',
        maxWidth: '95vw',
        autoFocus: false,
        data: prefill,
      })
      .afterClosed()
      .subscribe((flipRecord) => {
        if (!flipRecord) return;
        this.flipRecordDataService.addFlipRecord(flipRecord).subscribe(() => {
          this.snackBar
            .open(`"${flipRecord.itemName}" added to your flips`, 'View Flips', { duration: 6000 })
            .onAction()
            .subscribe(() => this.router.navigate(['/flips']));
        });
      });
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

/** yyyy-MM-dd in local time, so the API stores the date you actually see. */
function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
