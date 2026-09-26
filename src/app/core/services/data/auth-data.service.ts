import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppConstants } from '@app/shared/app-constants';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '@app/shared/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthDataService {
  private readonly baseUrl = `${environment.api.rootUrl}/${AppConstants.API_PREFIX}auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request);
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`);
  }
}
