import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Intercepteur HTTP pour ajouter l'URL de base de l'API
 * et gérer les erreurs communes
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    // Ajouter l'URL de base si la requête commence par /api
    const apiReq = req.url.startsWith('/api')
        ? req.clone({
            url: `${environment.apiUrl}${req.url.substring(4)}`,
        })
        : req;

    return next(apiReq);
};
