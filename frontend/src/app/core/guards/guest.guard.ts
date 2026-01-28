import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour empêcher l'accès aux pages login/register si déjà connecté
 */
export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('🛡️ guestGuard - isAuthenticated:', authService.isAuthenticated());

    if (!authService.isAuthenticated()) {
        console.log('✅ guestGuard - Utilisateur non connecté, accès autorisé');
        return true;
    }

    // Rediriger vers le dashboard approprié selon le rôle
    const dashboardUrl = authService.getDashboardUrl();
    console.log('🔄 guestGuard - Utilisateur déjà connecté, redirection vers:', dashboardUrl);
    router.navigate([dashboardUrl]);
    return false;
};
