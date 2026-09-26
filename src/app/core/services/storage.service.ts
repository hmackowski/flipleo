import { Injectable } from '@angular/core';

import { AuthResponse } from '@app/shared/models';

/**
 * Browser storage is only used to remember the login session (the JWT) between page loads.
 * Auctions and flip records live in the database and are loaded through the API.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly AUTH_KEY = 'flipleo_auth';

  saveAuthData(auth: AuthResponse): void {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(auth));
  }

  getAuthData(): AuthResponse | null {
    const data = localStorage.getItem(this.AUTH_KEY);
    if (!data) return null;

    try {
      const auth = JSON.parse(data) as AuthResponse;
      // Old format from the fake login, or damaged data: ignore it
      return auth?.token && auth?.user ? auth : null;
    } catch {
      return null;
    }
  }

  clearAuthData(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }
}
