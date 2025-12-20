import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FlipRecord } from '../../models/flip-record.model';
import {StorageService} from '../../services/storage.service';
import {MatDialog} from '@angular/material/dialog';
import {CreateAddOnDialog} from './create-add-on-dialog/create-add-on-dialog';
import {Auction} from '../../models/auction.model';

@Component({
  selector: 'app-flip-records',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './flip-records.component.html',
  styleUrl: './flip-records.component.scss'
})
export class FlipRecords {
  // Form fields
  itemName = signal('');
  buyPrice = signal<number | null>(null);
  partsPrice = signal<number | null>(null);
  sellPrice = signal<number | null>(null);

  // Records
  records = signal<FlipRecord[]>([]);
  nextId = 1;

  // Table columns
  displayedColumns = ['date', 'itemName', 'buyPrice', 'partsPrice', 'sellPrice', 'profit', 'actions'];
  constructor(
    private storageService: StorageService,
    private dialog: MatDialog
  ) {}

  addRecord() {
    const buy = this.buyPrice() || 0;
    const parts = this.partsPrice() || 0;
    const sell = this.sellPrice() || 0;
    const profit = sell - buy - parts;

    const newRecord: FlipRecord = {
      id: this.nextId++,
      itemName: this.itemName(),
      buyPrice: buy,
      partsPrice: parts,
      sellPrice: sell,
      profit: profit,
      date: new Date()
    };

    this.records.update(records => [...records, newRecord]);

    // Reset form
    this.itemName.set('');
    this.buyPrice.set(null);
    this.partsPrice.set(null);
    this.sellPrice.set(null);
  }

  deleteRecord(id: number) {
    this.records.update(records => records.filter(r => r.id !== id));
  }

  getTotalProfit(): number {
    return this.records().reduce((sum, record) => sum + record.profit, 0);
  }

  isFormValid(): boolean {
    return this.itemName().trim() !== '' &&
           this.buyPrice() !== null &&
           this.sellPrice() !== null;
  }

  openCreateAddOnDialog() {
    const ref = this.dialog.open(CreateAddOnDialog, {
      width: '800px',
      maxWidth: '95vw',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((data?: Omit<Auction, 'id'>) => {
    });
  }
}
