package com.skill.backend.service;

import com.skill.backend.dto.CreateUserRequest;
import com.skill.backend.entity.*;
import com.skill.backend.enums.Provider;
import com.skill.backend.enums.Role;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service pour la gestion des utilisateurs par les administrateurs/RH
 * Utilisé en production pour créer des utilisateurs sans passer par le register public
 */
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UtilisateurRepository utilisateurRepository;
    private final EmployeRepository employeRepository;
    private final ManagerRepository managerRepository;
    private final RHRepository rhRepository;
    private final ChefProjetRepository chefProjetRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    /**
     * Créer un nouvel utilisateur (réservé aux RH)
     */
    @PreAuthorize("hasRole('RH')")
    @Transactional
    public Utilisateur createUser(CreateUserRequest request, String createdBy) {
        // Vérifier que l'email n'existe pas déjà
        if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        Utilisateur user = createUserByRole(request);
        Utilisateur saved = utilisateurRepository.save(user);

        // Log la création
        auditLogService.logAction(createdBy, "CREATE_USER", "UTILISATEUR", 
            null, "Utilisateur créé: " + request.getEmail() + " (" + request.getRole() + ")");

        // Envoyer l'email de bienvenue avec les identifiants
        emailService.sendWelcomeEmail(
            request.getEmail(),
            request.getPrenom() + " " + request.getNom(),
            request.getEmail(),
            request.getPassword()
        );

        // Notifier l'utilisateur créé dans l'application
        notificationService.createNotification(
            saved.getId(),
            "Bienvenue sur SkillMap",
            "Votre compte a été créé. Consultez votre email pour vos identifiants de connexion.",
            "INFO"
        );

        return saved;
    }

    /**
     * Créer l'entité utilisateur spécifique selon le rôle
     */
    private Utilisateur createUserByRole(CreateUserRequest request) {
        Utilisateur user;
        
        switch (request.getRole()) {
            case EMPLOYE:
                Employe employe = new Employe();
                setCommonFields(employe, request);
                
                // Champs spécifiques Employe
                employe.setMatricule(request.getMatricule());
                employe.setPoste(request.getPoste());
                employe.setDepartement(request.getDepartement());
                employe.setDateEmbauche(request.getDateEmbauche());
                employe.setNiveauExperience(request.getNiveauExperience());
                employe.setDisponibilite(request.getDisponibilite() != null ? request.getDisponibilite() : true);
                
                // Assigner le manager si spécifié
                if (request.getManagerId() != null) {
                    managerRepository.findById(request.getManagerId()).ifPresent(employe::setManager);
                }
                
                user = employe;
                break;
                
            case MANAGER:
                Manager manager = new Manager();
                setCommonFields(manager, request);
                manager.setDepartementResponsable(request.getDepartementResponsable() != null 
                    ? request.getDepartementResponsable() 
                    : request.getDepartement());
                user = manager;
                break;
                
            case RH:
                RH rh = new RH();
                setCommonFields(rh, request);
                rh.setService(request.getService() != null 
                    ? request.getService() 
                    : request.getDepartement());
                user = rh;
                break;
                
            case CHEF_PROJET:
                ChefProjet chefProjet = new ChefProjet();
                setCommonFields(chefProjet, request);
                chefProjet.setDomaine(request.getDomaine() != null 
                    ? request.getDomaine() 
                    : request.getDepartement());
                user = chefProjet;
                break;
                
            default:
                user = new Utilisateur();
                setCommonFields(user, request);
        }
        
        return user;
    }

    /**
     * Définir les champs communs à tous les utilisateurs
     */
    private void setCommonFields(Utilisateur user, CreateUserRequest request) {
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setProvider(Provider.LOCAL);
        user.setEnabled(true);
    }

    /**
     * Désactiver un utilisateur
     */
    @PreAuthorize("hasRole('RH')")
    public Utilisateur disableUser(String userId, String disabledBy) {
        Utilisateur user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        user.setEnabled(false);
        Utilisateur updated = utilisateurRepository.save(user);

        // Log la désactivation
        auditLogService.logAction(disabledBy, "DISABLE_USER", "UTILISATEUR", 
            userId, "Utilisateur désactivé: " + user.getEmail());

        return updated;
    }

    /**
     * Réactiver un utilisateur
     */
    @PreAuthorize("hasRole('RH')")
    public Utilisateur enableUser(String userId, String enabledBy) {
        Utilisateur user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        user.setEnabled(true);
        Utilisateur updated = utilisateurRepository.save(user);

        // Log la réactivation
        auditLogService.logAction(enabledBy, "ENABLE_USER", "UTILISATEUR", 
            userId, "Utilisateur réactivé: " + user.getEmail());

        return updated;
    }
}
