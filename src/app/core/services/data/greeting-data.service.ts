import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppConstants } from '@app/shared/app-constants';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class GreetingDataService {
  constructor(private http: HttpClient) {}

  getGreeting(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(
      `${environment.api.rootUrl}/${AppConstants.API_PREFIX}greetings`
    );
  }
}
