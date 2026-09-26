import { catchError, throwError } from 'rxjs';

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '@app/core/services/auth.service';

/**
 * Shows a message for any failed API call (like HttpErrorInterceptor at work), so
 * components don't each need their own error handling.
 * The API returns ProblemDetails, so `error.detail` holds the readable message.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Errors from the sign-in / password pages are shown on the form itself
      const isAuthRequest = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
        .some((path) => req.url.includes(path));

      if (error.status === 401 && !isAuthRequest) {
        // Token expired or invalid: end the session and send them to log in again
        authService.logout(true);
        snackBar.open('Your session has expired. Please log in again.', 'Dismiss', { duration: 6000 });
      } else if (!isAuthRequest) {
        snackBar.open(getErrorMessage(error), 'Dismiss', { duration: 6000 });
      }

      return throwError(() => error);
    })
  );
};

export function getErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Could not reach the FlipLeo API. Is it running?';
  }

  // Validation errors from [ApiController]: { errors: { Field: ["message"] } }
  const validationErrors = error.error?.errors;
  if (validationErrors) {
    const messages = Object.values(validationErrors).flat();
    if (messages.length) return messages.join(' ');
  }

  return error.error?.detail ?? error.error?.title ?? `Request failed (${error.status})`;
}
