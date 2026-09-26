import { Component, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { Auction } from '@app/shared/models';
import { getCountdown, isAuctionEnded, isEndingWithin3Hours } from '../auction-time.utils';

/** Card view of the tracked auctions (the alternative to the table). Actions are raised to the grid. */
@Component({
  selector: 'app-auction-cards',
  imports: [CurrencyPipe, DatePipe, MatButton, MatIconButton, MatIcon, MatMenuModule],
  templateUrl: './auction-cards.html',
  styleUrl: './auction-cards.scss',
})
export class AuctionCards {
  auctions = input.required<Auction[]>();

  edit = output<Auction>();
  delete = output<number>();
  openLink = output<string>();
  createFlip = output<Auction>();

  getCountdown = getCountdown;
  isAuctionEnded = isAuctionEnded;
  isEndingWithin3Hours = isEndingWithin3Hours;

  /** Auctions whose image link failed to load (shown with the placeholder instead). */
  brokenImages = signal(new Set<number>());

  markBroken(id: number) {
    this.brokenImages.update((ids) => new Set(ids).add(id));
  }
}
