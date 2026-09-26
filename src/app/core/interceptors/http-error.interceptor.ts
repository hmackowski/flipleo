import { catchError, throwError } from 'rxjs';

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Shows a message for any failed API call (like HttpErrorInterceptor at work), so
 * components don't each need their own error handling.
 * The API returns ProblemDetails, so `error.detail` holds the readable message.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      snackBar.open(getMessage(error), 'Dismiss', { duration: 6000 });
      return throwError(() => error);
    })
  );
};

function getMessage(error: HttpErrorResponse): string {
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
