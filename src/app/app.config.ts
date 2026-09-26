import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { authInterceptor } from '@app/core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from '@app/core/interceptors/http-error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Order matters: the token is added first, then errors are handled on the way back
    provideHttpClient(withInterceptors([authInterceptor, httpErrorInterceptor]))
  ]
};
