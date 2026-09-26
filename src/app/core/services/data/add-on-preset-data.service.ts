import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppConstants } from '@app/shared/app-constants';
import { AddOnPreset, SuccessResult } from '@app/shared/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AddOnPresetDataService {
  private readonly baseUrl = `${environment.api.rootUrl}/${AppConstants.API_PREFIX}add-on-presets`;

  constructor(private http: HttpClient) {}

  getAddOnPresets(): Observable<AddOnPreset[]> {
    return this.http.get<AddOnPreset[]>(this.baseUrl);
  }

  addAddOnPreset(addOnPreset: AddOnPreset): Observable<AddOnPreset> {
    return this.http.post<AddOnPreset>(this.baseUrl, addOnPreset);
  }

  updateAddOnPreset(addOnPreset: AddOnPreset): Observable<AddOnPreset> {
    return this.http.put<AddOnPreset>(this.baseUrl, addOnPreset);
  }

  deleteAddOnPreset(addOnPresetId: number): Observable<SuccessResult> {
    return this.http.delete<SuccessResult>(`${this.baseUrl}/${addOnPresetId}`);
  }
}
