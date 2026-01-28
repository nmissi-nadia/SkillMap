import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour la route racine qui redirige vers le dashboard approprié
 */
export const rootRedirectGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const dashboardUrl = authService.getDashboardUrl();
        router.navigate([dashboardUrl]);
    } else {
        router.navigate(['/login']);
    }

    return false;
};
