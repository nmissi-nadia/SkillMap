import { RoleUtilisateur } from './role.enum';

/**
 * Requête de connexion
 * Correspond à AuthenticationRequest du backend
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Requête d'inscription
 * Correspond à RegisterRequest du backend
 */
export interface RegisterRequest {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: RoleUtilisateur;
}

/**
 * Réponse d'authentification
 * Correspond à AuthenticationResponse du backend
 */
export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    // Informations utilisateur
    id: number;
    email: string;
    nom: string;
    prenom: string;
    role: RoleUtilisateur;
}

/**
 * Informations utilisateur décodées du JWT
 */
export interface User {
    id: number;
    email: string;
    nom?: string;
    prenom?: string;
    role: RoleUtilisateur;
    exp?: number; // Expiration timestamp
    iat?: number; // Issued at timestamp
}
