import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal(false);
  userName = signal('');

  constructor(private storageService: StorageService) {
    this.loadAuthState();
  }

  private loadAuthState() {
    const authData = this.storageService.getAuthData();
    if (authData) {
      this.isLoggedIn.set(true);
      this.userName.set(authData.userName);
    }
  }

  login(username: string, password: string): boolean {
    if (username === 'flip' && password === 'leo') {
      this.isLoggedIn.set(true);
      this.userName.set('Haskell');
      this.storageService.saveAuthData('Haskell');
      return true;
    }
    return false;
  }

  logout() {
    this.isLoggedIn.set(false);
    this.userName.set('');
    this.storageService.clearAuthData();
  }
}
