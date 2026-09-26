import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

/**
 * The opposite of authGuard: for pages only signed-out visitors need (landing page, login,
 * forgot password). Signed-in users are sent straight into the app instead.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn() ? router.createUrlTree(['/flips']) : true;
};
