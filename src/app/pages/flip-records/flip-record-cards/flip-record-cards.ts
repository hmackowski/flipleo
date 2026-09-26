import { Component, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';

import { FlipRecord, FlipStatusIds } from '@app/shared/models';

/** Card view of the flips (the alternative to the table). Clicking a card edits it; the ⋮ menu has the rest. Actions are raised to the page. */
@Component({
  selector: 'app-flip-record-cards',
  imports: [CurrencyPipe, DatePipe, PercentPipe, MatIconButton, MatIcon, MatMenuModule],
  templateUrl: './flip-record-cards.html',
  styleUrl: './flip-record-cards.scss',
})
export class FlipRecordCards {
  records = input.required<FlipRecord[]>();

  edit = output<FlipRecord>();
  delete = output<FlipRecord>();
  addAddOns = output<FlipRecord>();

  readonly FlipStatusIds = FlipStatusIds;

  /** Flips whose image link failed to load (shown with the placeholder instead). */
  brokenImages = signal(new Set<number>());

  markBroken(id: number) {
    this.brokenImages.update((ids) => new Set(ids).add(id));
  }

  /** Unsold with an asking price: what the profit would be at that price (not counted in Total Profit). */
  expectedProfit(record: FlipRecord): number | null {
    if (record.profit != null || record.sellPrice == null) return null;
    return record.sellPrice - record.buyPrice - (record.partsPrice ?? 0);
  }

  /** Return on investment: profit / (buy + parts). Only for sold flips. */
  roi(record: FlipRecord): number | null {
    const cost = record.buyPrice + (record.partsPrice ?? 0);
    return record.profit != null && cost > 0 ? record.profit / cost : null;
  }
}
