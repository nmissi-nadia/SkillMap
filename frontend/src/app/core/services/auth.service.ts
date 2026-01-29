import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';
import { TokenService } from './token.service';

/**
 * Service d'authentification
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private tokenService = inject(TokenService);
    private router = inject(Router);

    private apiUrl = 'http://localhost:8085/api/auth';

    // Signal pour l'utilisateur actuel
    currentUser = signal<User | null>(null);

    constructor() {
        // Charger l'utilisateur depuis le token au démarrage
        this.loadUserFromToken();
    }

    /**
     * Connexion d'un utilisateur
     */
    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials)
            .pipe(
                tap(response => {
                    this.handleAuthResponse(response);
                    this.redirectBasedOnRole(response.role);
                })
            );
    }

    /**
     * Inscription d'un nouvel utilisateur
     */
    register(userData: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
            .pipe(
                tap(response => {
                    this.handleAuthResponse(response);
                    this.redirectBasedOnRole(response.role);
                })
            );
    }

    /**
     * Déconnexion de l'utilisateur
     */
    logout(): void {
        console.log('🚪 Déconnexion en cours...');
        this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
            next: () => console.log('✅ Déconnexion backend réussie'),
            error: (err) => console.error('❌ Erreur déconnexion backend:', err),
            complete: () => {
                this.tokenService.removeTokens();
                localStorage.removeItem('current_user');
                this.currentUser.set(null);
                this.router.navigate(['/login']);
                console.log('👋 Déconnexion locale terminée');
            }
        });
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated(): boolean {
        return this.tokenService.isAuthenticated();
    }

    /**
     * Récupérer le token d'accès
     */
    getToken(): string | null {
        return this.tokenService.getAccessToken();
    }

    /**
     * Récupérer l'utilisateur actuel
     */
    getCurrentUser(): User | null {
        return this.currentUser();
    }

    /**
   * Gérer la réponse d'authentification
   */
    private handleAuthResponse(response: AuthResponse): void {
        console.log('🔐 handleAuthResponse - Réponse reçue:', response);

        // Sauvegarder les tokens
        console.log('💾 Sauvegarde des tokens...');
        this.tokenService.saveTokens(response.access_token, response.refresh_token);
        console.log('✅ Tokens sauvegardés');

        // Créer l'objet utilisateur depuis la réponse
        const user: User = {
            id: response.id,
            email: response.email,
            nom: response.nom,
            prenom: response.prenom,
            role: response.role
        };

        console.log('👤 Utilisateur créé:', user);

        // Sauvegarder l'utilisateur
        this.saveUser(user);
        console.log('✅ Utilisateur sauvegardé dans localStorage');

        this.currentUser.set(user);
        console.log('✅ Signal currentUser mis à jour');
    }

    /**
     * Obtenir l'URL du dashboard selon le rôle de l'utilisateur
     */
    getDashboardUrl(role?: string): string {
        const userRole = role || this.currentUser()?.role;
        console.log('🔍 getDashboardUrl - Role reçu:', role);
        console.log('🔍 getDashboardUrl - Role utilisateur actuel:', this.currentUser()?.role);
        console.log('🔍 getDashboardUrl - Role final utilisé:', userRole);

        switch (userRole) {
            case 'EMPLOYE':
                console.log('✅ Redirection vers /employee/dashboard');
                return '/employee/dashboard';
            case 'MANAGER':
            case 'RH':
            case 'CHEF_PROJET':
            case 'ADMIN':
                console.log('✅ Redirection vers /dashboard');
                return '/dashboard';
            default:
                console.log('⚠️ Rôle non reconnu, redirection par défaut vers /dashboard');
                return '/dashboard';
        }
    }

    /**
     * Rediriger l'utilisateur selon son rôle
     */
    private redirectBasedOnRole(role: string): void {
        console.log('🚀 redirectBasedOnRole appelé avec role:', role);
        const dashboardUrl = this.getDashboardUrl(role);
        console.log('🎯 Navigation vers:', dashboardUrl);
        this.router.navigate([dashboardUrl]);
    }

    /**
     * Sauvegarder l'utilisateur dans le localStorage
     */
    private saveUser(user: User): void {
        localStorage.setItem('current_user', JSON.stringify(user));
    }

    /**
     * Charger l'utilisateur depuis le localStorage
     */
    private loadUserFromToken(): void {
        const token = this.tokenService.getAccessToken();
        if (token && !this.tokenService.isTokenExpired(token)) {
            // Charger l'utilisateur depuis le localStorage
            const userJson = localStorage.getItem('current_user');
            if (userJson) {
                try {
                    const user = JSON.parse(userJson) as User;
                    this.currentUser.set(user);
                } catch (error) {
                    console.error('Erreur lors du chargement de l\'utilisateur:', error);
                    this.currentUser.set(null);
                }
            }
        } else {
            this.currentUser.set(null);
            localStorage.removeItem('current_user');
        }
    }
}
