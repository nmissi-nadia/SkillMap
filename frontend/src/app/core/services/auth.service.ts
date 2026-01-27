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
        this.tokenService.saveTokens(response.access_token, response.refresh_token);
        this.loadUserFromToken();
    }

    /**
     * Charger l'utilisateur depuis le token
     */
    private loadUserFromToken(): void {
        const token = this.tokenService.getAccessToken();
        if (token && !this.tokenService.isTokenExpired(token)) {
            const user = this.tokenService.decodeToken(token);
            this.currentUser.set(user);
        } else {
            this.currentUser.set(null);
        }
    }
}
