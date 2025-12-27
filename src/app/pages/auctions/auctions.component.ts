import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { Auction } from '../../models/auction.model';
import { StorageService } from '../../services/storage.service';
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
  nextId = 1;

  private countdownInterval?: ReturnType<typeof setInterval>;

  constructor(
    private storageService: StorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadAuctions();

    this.countdownInterval = setInterval(() => {
      this.auctions.set([...this.auctions()]);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  loadAuctions() {
    const storedAuctions = this.storageService.getAuctions();
    this.auctions.set(storedAuctions);
    if (storedAuctions.length) {
      this.nextId = Math.max(...storedAuctions.map(a => a.id)) + 1;
    }
  }

  openCreateAuctionDialog() {
    const ref = this.dialog.open(AuctionCreateDialog, {
      width: '800px',
      maxWidth: '95vw',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((data?: Omit<Auction, 'id'>) => {
      if (!data) return;

      const newAuction: Auction = {
        id: this.nextId++,
        ...data,
      };

      this.auctions.update(a => [...a, newAuction]);
      this.storageService.addAuction(newAuction);
    });
  }

  deleteAuction(id: number) {
    const index = this.auctions().findIndex(a => a.id === id);
    if (index !== -1) {
      this.auctions.update(a => a.filter(x => x.id !== id));
      this.storageService.deleteAuction(index);
    }
  }

  editAuction(updatedAuction: Auction) {
    const index = this.auctions().findIndex(a => a.id === updatedAuction.id);
    if (index !== -1) {
      this.auctions.update(a => {
        const updated = [...a];
        updated[index] = updatedAuction;
        return updated;
      });
      this.storageService.updateAuction(index, updatedAuction);
    }
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }
}
