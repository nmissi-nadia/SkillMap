package com.skill.backend.service;

import com.skill.backend.dto.AuthenticationRequest;
import com.skill.backend.dto.AuthenticationResponse;
import com.skill.backend.dto.RegisterRequest;
import com.skill.backend.entity.*;
import com.skill.backend.enums.Provider;
import com.skill.backend.enums.RoleUtilisateur;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UtilisateurRepository repository;
    private final EmployeRepository employeRepository;
    private final ManagerRepository managerRepository;
    private final RHRepository rhRepository;
    private final ChefProjetRepository chefProjetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        // Créer l'entité spécifique selon le rôle
        Utilisateur user = createUserByRole(request);
        
        // Sauvegarder l'utilisateur (cascade sauvegarde automatiquement l'entité spécifique)
        repository.save(user);
        
        // Log l'inscription
        auditLogService.logAuthentication(user.getId(), "REGISTER", true);
        
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole())
                .build();
    }

    /**
     * Créer l'entité utilisateur spécifique selon le rôle
     */
    private Utilisateur createUserByRole(RegisterRequest request) {
        Utilisateur user;
        
        switch (request.getRole()) {
            case EMPLOYE:
                Employe employe = new Employe();
                employe.setNom(request.getNom());
                employe.setPrenom(request.getPrenom());
                employe.setEmail(request.getEmail());
                employe.setPassword(passwordEncoder.encode(request.getPassword()));
                employe.setRole(RoleUtilisateur.EMPLOYE);
                employe.setProvider(Provider.LOCAL);
                employe.setEnabled(true);
                // Champs spécifiques Employe peuvent être ajoutés ici
                user = employe;
                break;
                
            case MANAGER:
                Manager manager = new Manager();
                manager.setNom(request.getNom());
                manager.setPrenom(request.getPrenom());
                manager.setEmail(request.getEmail());
                manager.setPassword(passwordEncoder.encode(request.getPassword()));
                manager.setRole(RoleUtilisateur.MANAGER);
                manager.setProvider(Provider.LOCAL);
                manager.setEnabled(true);
                // Champs spécifiques Manager peuvent être ajoutés ici
                user = manager;
                break;
                
            case RH:
                RH rh = new RH();
                rh.setNom(request.getNom());
                rh.setPrenom(request.getPrenom());
                rh.setEmail(request.getEmail());
                rh.setPassword(passwordEncoder.encode(request.getPassword()));
                rh.setRole(RoleUtilisateur.RH);
                rh.setProvider(Provider.LOCAL);
                rh.setEnabled(true);
                // Champs spécifiques RH peuvent être ajoutés ici
                user = rh;
                break;
                
            case CHEF_PROJET:
                ChefProjet chefProjet = new ChefProjet();
                chefProjet.setNom(request.getNom());
                chefProjet.setPrenom(request.getPrenom());
                chefProjet.setEmail(request.getEmail());
                chefProjet.setPassword(passwordEncoder.encode(request.getPassword()));
                chefProjet.setRole(RoleUtilisateur.CHEF_PROJET);
                chefProjet.setProvider(Provider.LOCAL);
                chefProjet.setEnabled(true);
                // Champs spécifiques ChefProjet peuvent être ajoutés ici
                user = chefProjet;
                break;
                
            default:
                // Par défaut, créer un Utilisateur simple
                user = new Utilisateur();
                user.setNom(request.getNom());
                user.setPrenom(request.getPrenom());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setRole(request.getRole());
                user.setProvider(Provider.LOCAL);
                user.setEnabled(true);
        }
        
        return user;
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            var user = repository.findByEmail(request.getEmail())
                    .orElseThrow();
            
            System.out.println("✅ User authenticated: " + user.getEmail());
            System.out.println("👤 User role: " + user.getRole());
            System.out.println("🔑 User authorities: " + user.getAuthorities());
            
            // Log la connexion réussie
            auditLogService.logAuthentication(user.getId(), "LOGIN", true);
            
            var jwtToken = jwtService.generateToken(user);
            System.out.println("🎫 JWT token generated (first 30 chars): " + jwtToken.substring(0, Math.min(30, jwtToken.length())) + "...");
            var refreshToken = jwtService.generateRefreshToken(user);
            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .id(user.getId())
                    .email(user.getEmail())
                    .nom(user.getNom())
                    .prenom(user.getPrenom())
                    .role(user.getRole())
                    .build();
        } catch (Exception e) {
            // Log la connexion échouée
            repository.findByEmail(request.getEmail())
                    .ifPresent(user -> auditLogService.logAuthentication(user.getId(), "LOGIN", false));
            throw e;
        }
    }
}
