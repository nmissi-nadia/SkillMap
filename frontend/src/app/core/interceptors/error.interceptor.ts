import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepteur HTTP pour gérer les erreurs
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error) => {
            console.error('HTTP Error:', error);

            // Gérer les erreurs spécifiques
            switch (error.status) {
                case 401:
                    // Non autorisé - rediriger vers la page de connexion
                    router.navigate(['/login']);
                    break;
                case 403:
                    // Interdit - accès refusé
                    console.error('Accès refusé');
                    break;
                case 404:
                    // Non trouvé
                    console.error('Ressource non trouvée');
                    break;
                case 500:
                    // Erreur serveur
                    console.error('Erreur serveur interne');
                    break;
                default:
                    console.error('Erreur inattendue');
            }

            return throwError(() => error);
        })
    );
};
