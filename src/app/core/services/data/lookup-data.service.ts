import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppConstants } from '@app/shared/app-constants';
import { AuctionSite, FlipStatus } from '@app/shared/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class LookupDataService {
  private readonly baseUrl = `${environment.api.rootUrl}/${AppConstants.API_PREFIX}lookups`;

  constructor(private http: HttpClient) {}

  getAuctionSites(): Observable<AuctionSite[]> {
    return this.http.get<AuctionSite[]>(`${this.baseUrl}/auction-sites`);
  }

  getFlipStatuses(): Observable<FlipStatus[]> {
    return this.http.get<FlipStatus[]>(`${this.baseUrl}/flip-statuses`);
  }
}
