import { Observable, map } from 'rxjs';

import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthDataService } from '@app/core/services/data/auth-data.service';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '@app/shared/models';
import { StorageService } from './storage.service';

/**
 * Holds the login session for the whole app.
 * The JWT from the API is kept in memory (signals) and in localStorage so a page refresh keeps you logged in.
 * authInterceptor reads `token()` and adds it to every API call.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private session = signal<AuthResponse | null>(null);
  private logoutTimer?: ReturnType<typeof setTimeout>;

  user = computed<UserProfile | null>(() => this.session()?.user ?? null);
  isLoggedIn = computed(() => this.session() !== null);
  userName = computed(() => this.session()?.user.displayName ?? '');
  token = computed(() => this.session()?.token ?? null);

  constructor(
    private authDataService: AuthDataService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.restoreSession();
  }

  login(request: LoginRequest): Observable<UserProfile> {
    return this.authDataService.login(request).pipe(map((auth) => this.startSession(auth)));
  }

  register(request: RegisterRequest): Observable<UserProfile> {
    return this.authDataService.register(request).pipe(map((auth) => this.startSession(auth)));
  }

  logout(redirectToLogin = false) {
    clearTimeout(this.logoutTimer);
    this.session.set(null);
    this.storageService.clearAuthData();

    if (redirectToLogin) {
      this.router.navigate(['/login']);
    }
  }

  private startSession(auth: AuthResponse): UserProfile {
    this.storageService.saveAuthData(auth);
    this.session.set(auth);
    this.scheduleAutoLogout(auth);
    return auth.user;
  }

  /** On page load: pick the saved session back up, unless the token has expired. */
  private restoreSession() {
    const auth = this.storageService.getAuthData();
    if (!auth) return;

    if (new Date(auth.expiresAt).getTime() <= Date.now()) {
      this.storageService.clearAuthData();
      return;
    }

    this.session.set(auth);
    this.scheduleAutoLogout(auth);
  }

  /** Log out automatically the moment the token expires. */
  private scheduleAutoLogout(auth: AuthResponse) {
    clearTimeout(this.logoutTimer);
    const msUntilExpiry = new Date(auth.expiresAt).getTime() - Date.now();
    // setTimeout can't handle delays longer than ~24.8 days
    if (msUntilExpiry > 0 && msUntilExpiry < 2_147_483_647) {
      this.logoutTimer = setTimeout(() => this.logout(true), msUntilExpiry);
    }
  }
}
