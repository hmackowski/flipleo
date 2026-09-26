import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '@app/core/services/auth.service';
import { environment } from '@env/environment';

/**
 * Adds "Authorization: Bearer <token>" to every request going to the FlipLeo API
 * (like AuthInterceptor at work). Requests to other sites never get the token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const isApiRequest = req.url.startsWith(environment.api.rootUrl);

  if (!token || !isApiRequest) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
