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
                tap(response => this.handleAuthResponse(response))
            );
    }

    /**
     * Inscription d'un nouvel utilisateur
     */
    register(userData: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
            .pipe(
                tap(response => this.handleAuthResponse(response))
            );
    }

    /**
     * Déconnexion de l'utilisateur
     */
    logout(): void {
        this.tokenService.removeTokens();
        localStorage.removeItem('current_user');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
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
        // Sauvegarder les tokens
        this.tokenService.saveTokens(response.access_token, response.refresh_token);

        // Créer l'objet utilisateur depuis la réponse
        const user: User = {
            id: response.id,
            email: response.email,
            nom: response.nom,
            prenom: response.prenom,
            role: response.role
        };

        // Sauvegarder l'utilisateur
        this.saveUser(user);
        this.currentUser.set(user);
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
