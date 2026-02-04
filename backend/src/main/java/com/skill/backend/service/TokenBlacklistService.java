package com.skill.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * Service pour gérer la blacklist des tokens JWT révoqués
 */
@Service
public class TokenBlacklistService {

    // En production, utiliser Redis ou une base de données
    // Pour le développement, on utilise un Set en mémoire
    private final Set<String> blacklistedTokens = new HashSet<>();

    /**
     * Ajouter un token à la blacklist
     */
    public void blacklistToken(String token) {
        if (token != null && !token.isEmpty()) {
            blacklistedTokens.add(token);
            System.out.println("🚫 Token ajouté à la blacklist: " + token.substring(0, Math.min(20, token.length())) + "...");
        }
    }

    /**
     * Vérifier si un token est blacklisté
     */
    public boolean isTokenBlacklisted(String token) {
        return token != null && blacklistedTokens.contains(token);
    }

    /**
     * Nettoyer la blacklist (à appeler périodiquement)
     * En production, les tokens expirés seraient automatiquement supprimés
     */
    public void cleanupExpiredTokens() {
        // TODO: Implémenter le nettoyage des tokens expirés
        // Pour l'instant, on garde tous les tokens en mémoire
    }

    /**
     * Obtenir le nombre de tokens blacklistés
     */
    public int getBlacklistedTokensCount() {
        return blacklistedTokens.size();
    }
}
