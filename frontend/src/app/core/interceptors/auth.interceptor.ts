import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

/**
 * Intercepteur pour ajouter le token JWT aux requêtes HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenService = inject(TokenService);
    const token = tokenService.getAccessToken();

    // Ne pas ajouter le token pour les requêtes d'authentification
    if (req.url.includes('/api/auth/')) {
        return next(req);
    }

    // Ajouter le token si disponible
    if (token && !tokenService.isTokenExpired(token)) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    return next(req);
};
