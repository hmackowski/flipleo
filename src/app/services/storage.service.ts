import { Injectable } from '@angular/core';
import { Auction } from '../models/auction.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly AUTH_KEY = 'flipleo_auth';
  private readonly AUCTIONS_KEY = 'flipleo_auctions';

  // Auth methods
  saveAuthData(userName: string): void {
    const authData = {
      userName,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
  }

  getAuthData(): { userName: string; timestamp: string } | null {
    const data = localStorage.getItem(this.AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }

  clearAuthData(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  isAuthenticated(): boolean {
    return this.getAuthData() !== null;
  }

  // Auction methods
  saveAuctions(auctions: Auction[]): void {
    localStorage.setItem(this.AUCTIONS_KEY, JSON.stringify(auctions));
  }

  getAuctions(): Auction[] {
    const data = localStorage.getItem(this.AUCTIONS_KEY);
    if (!data) {
      return [];
    }

    const auctions = JSON.parse(data);
    // Convert date strings back to Date objects
    return auctions.map((auction: any) => ({
      ...auction,
      startTime: new Date(auction.startTime),
      endTime: new Date(auction.endTime)
    }));
  }

  addAuction(auction: Auction): void {
    const auctions = this.getAuctions();
    auctions.push(auction);
    this.saveAuctions(auctions);
  }

  updateAuction(index: number, auction: Auction): void {
    const auctions = this.getAuctions();
    if (index >= 0 && index < auctions.length) {
      auctions[index] = auction;
      this.saveAuctions(auctions);
    }
  }

  deleteAuction(index: number): void {
    const auctions = this.getAuctions();
    if (index >= 0 && index < auctions.length) {
      auctions.splice(index, 1);
      this.saveAuctions(auctions);
    }
  }

  clearAuctions(): void {
    localStorage.removeItem(this.AUCTIONS_KEY);
  }
}
