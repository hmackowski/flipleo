import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppConstants } from '@app/shared/app-constants';
import { FlipRecord, FlipRecordAddOn, SuccessResult } from '@app/shared/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class FlipRecordDataService {
  private readonly baseUrl = `${environment.api.rootUrl}/${AppConstants.API_PREFIX}flip-records`;

  constructor(private http: HttpClient) {}

  getFlipRecords(): Observable<FlipRecord[]> {
    return this.http.get<FlipRecord[]>(this.baseUrl);
  }

  getFlipRecord(flipRecordId: number): Observable<FlipRecord> {
    return this.http.get<FlipRecord>(`${this.baseUrl}/${flipRecordId}`);
  }

  addFlipRecord(flipRecord: FlipRecord): Observable<FlipRecord> {
    return this.http.post<FlipRecord>(this.baseUrl, flipRecord);
  }

  updateFlipRecord(flipRecord: FlipRecord): Observable<FlipRecord> {
    return this.http.put<FlipRecord>(this.baseUrl, flipRecord);
  }

  deleteFlipRecord(flipRecordId: number): Observable<SuccessResult> {
    return this.http.delete<SuccessResult>(`${this.baseUrl}/${flipRecordId}`);
  }

  // Add-on endpoints return the parent flip record with recalculated totals

  addAddOn(flipRecordId: number, addOn: FlipRecordAddOn): Observable<FlipRecord> {
    return this.http.post<FlipRecord>(`${this.baseUrl}/${flipRecordId}/add-ons`, addOn);
  }

  updateAddOn(addOn: FlipRecordAddOn): Observable<FlipRecord> {
    return this.http.put<FlipRecord>(`${this.baseUrl}/add-ons`, addOn);
  }

  deleteAddOn(addOnId: number): Observable<FlipRecord> {
    return this.http.delete<FlipRecord>(`${this.baseUrl}/add-ons/${addOnId}`);
  }
}
