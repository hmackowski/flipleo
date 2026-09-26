import { Observable, map } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppConstants } from '@app/shared/app-constants';
import { Auction, SuccessResult } from '@app/shared/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AuctionDataService {
  private readonly baseUrl = `${environment.api.rootUrl}/${AppConstants.API_PREFIX}auctions`;

  constructor(private http: HttpClient) {}

  getAuctions(): Observable<Auction[]> {
    return this.http
      .get<Auction[]>(this.baseUrl)
      .pipe(map((auctions) => auctions.map(toAuction)));
  }

  getAuction(auctionId: number): Observable<Auction> {
    return this.http.get<Auction>(`${this.baseUrl}/${auctionId}`).pipe(map(toAuction));
  }

  addAuction(auction: Auction): Observable<Auction> {
    return this.http.post<Auction>(this.baseUrl, auction).pipe(map(toAuction));
  }

  updateAuction(auction: Auction): Observable<Auction> {
    return this.http.put<Auction>(this.baseUrl, auction).pipe(map(toAuction));
  }

  deleteAuction(auctionId: number): Observable<SuccessResult> {
    return this.http.delete<SuccessResult>(`${this.baseUrl}/${auctionId}`);
  }
}

// JSON has no Date type, so the API's date strings are turned back into Date objects here
function toAuction(auction: Auction): Auction {
  return {
    ...auction,
    startTime: new Date(auction.startTime),
    endTime: new Date(auction.endTime),
  };
}
