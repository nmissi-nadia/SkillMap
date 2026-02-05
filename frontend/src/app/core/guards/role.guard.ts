import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour vérifier que l'utilisateur a le bon rôle pour accéder à une route
 */
export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Récupérer les rôles requis depuis les données de la route
    const requiredRoles = route.data['roles'] as string[] | undefined;

    // Si aucun rôle n'est requis, autoriser l'accès
    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    // Vérifier si l'utilisateur a l'un des rôles requis
    const currentUser = authService.currentUser();
    if (currentUser && requiredRoles.includes(currentUser.role)) {
        return true;
    }

    // Rediriger vers le dashboard approprié ou la page d'accueil
    console.warn('Accès refusé - Rôle insuffisant');
    router.navigate(['/']);
    return false;
};
