import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiInterceptor, authInterceptor, errorInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};
