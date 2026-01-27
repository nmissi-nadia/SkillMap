import { Injectable } from '@angular/core';
import { User } from '../models/auth.model';

/**
 * Service de gestion des tokens JWT
 */
@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly ACCESS_TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';

    /**
     * Sauvegarder les tokens dans le localStorage
     */
    saveTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    /**
     * Récupérer le token d'accès
     */
    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    /**
     * Récupérer le token de rafraîchissement
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Supprimer tous les tokens
     */
    removeTokens(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Décoder un token JWT
     */
    decodeToken(token: string): User | null {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            return JSON.parse(decoded) as User;
        } catch (error) {
            console.error('Erreur lors du décodage du token:', error);
            return null;
        }
    }

    /**
     * Vérifier si le token est expiré
     */
    isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true;
        }

        const expirationDate = new Date(decoded.exp * 1000);
        return expirationDate < new Date();
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        if (!token) {
            return false;
        }
        return !this.isTokenExpired(token);
    }
}
