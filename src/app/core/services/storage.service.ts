import { Injectable } from '@angular/core';

/**
 * Browser storage is only used for the login session now.
 * Auctions and flip records are stored in the database through the API
 * (see core/services/data).
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly AUTH_KEY = 'flipleo_auth';

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
}
