package com.skill.backend.controller;

import com.skill.backend.dto.AuthenticationRequest;
import com.skill.backend.dto.AuthenticationResponse;
import com.skill.backend.dto.RegisterRequest;
import com.skill.backend.service.AuthService;
import com.skill.backend.service.TokenBlacklistService;
import com.skill.backend.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuditLogService auditLogService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            Authentication authentication
    ) {
        System.out.println("🚪 Logout request received");
        
        Map<String, String> response = new HashMap<>();
        
        try {
            // Extraire le token JWT du header Authorization
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                // Ajouter le token à la blacklist
                tokenBlacklistService.blacklistToken(token);
                System.out.println("✅ Token blacklisté avec succès");
                
                // Logger la déconnexion
                if (authentication != null && authentication.getName() != null) {
                    auditLogService.logAction(
                        authentication.getName(),
                        "LOGOUT",
                        "Utilisateur",
                        null,
                        "Déconnexion réussie"
                    );
                    System.out.println("📝 Déconnexion loggée pour: " + authentication.getName());
                }
                
                response.put("message", "Déconnexion réussie");
                response.put("status", "success");
            } else {
                System.out.println("⚠️ Aucun token fourni dans le header Authorization");
                response.put("message", "Déconnexion réussie (aucun token à révoquer)");
                response.put("status", "success");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors du logout: " + e.getMessage());
            response.put("message", "Déconnexion réussie avec avertissement");
            response.put("status", "warning");
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, Boolean>> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Map<String, Boolean> response = new HashMap<>();
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(token);
            response.put("valid", !isBlacklisted);
            response.put("blacklisted", isBlacklisted);
        } else {
            response.put("valid", false);
            response.put("blacklisted", false);
        }
        
        return ResponseEntity.ok(response);
    }
}
