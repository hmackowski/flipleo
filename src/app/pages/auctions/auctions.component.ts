import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { Auction } from '../../models/auction.model';
import { StorageService } from '../../services/storage.service';
import { AuctionGrid } from './auction-grid/auction-grid';

@Component({
  selector: 'app-auctions',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    AuctionGrid
  ],
  templateUrl: './auctions.component.html',
  styleUrl: './auctions.component.scss',
})
export class AuctionsComponent implements OnInit, OnDestroy {
  // Form fields
  itemName = signal('');
  currentPrice = signal<number | null>(null);
  auctionLink = signal('');
  endTime = signal('');
  notes = signal('');

  // Records
  auctions = signal<Auction[]>([]);
  nextId = 1;

  // Timer for countdown updates
  private countdownInterval?: ReturnType<typeof setInterval>;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.loadAuctions();
    // Update countdown every second
    this.countdownInterval = setInterval(() => {
      // Trigger change detection by updating the signal
      this.auctions.set([...this.auctions()]);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  loadAuctions() {
    const storedAuctions = this.storageService.getAuctions();
    this.auctions.set(storedAuctions);
    if (storedAuctions.length > 0) {
      this.nextId = Math.max(...storedAuctions.map(a => a.id)) + 1;
    }
  }

  addAuction() {
    const newAuction: Auction = {
      id: this.nextId++,
      name: this.itemName(),
      startTime: new Date(),
      currentPrice: this.currentPrice() || 0,
      link: this.auctionLink(),
      endTime: new Date(this.endTime()),
      notes: this.notes() || undefined
    };

    this.auctions.update(auctions => [...auctions, newAuction]);
    this.storageService.addAuction(newAuction);

    // Reset form
    this.itemName.set('');
    this.currentPrice.set(null);
    this.auctionLink.set('');
    this.endTime.set('');
    this.notes.set('');
  }

  deleteAuction(id: number) {
    const index = this.auctions().findIndex(a => a.id === id);
    if (index !== -1) {
      this.auctions.update(auctions => auctions.filter(a => a.id !== id));
      this.storageService.deleteAuction(index);
    }
  }

  isFormValid(): boolean {
    return this.itemName().trim() !== '' &&
           this.currentPrice() !== null &&
           this.auctionLink().trim() !== '' &&
           this.endTime().trim() !== '';
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }

  openCreateAuctionDialog(){

  }
}
