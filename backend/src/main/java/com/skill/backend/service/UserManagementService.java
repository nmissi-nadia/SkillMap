package com.skill.backend.service;

import com.skill.backend.dto.CreateUserRequest;
import com.skill.backend.dto.UpdateUserRequest;
import com.skill.backend.entity.*;
import com.skill.backend.enums.Provider;
import com.skill.backend.enums.RoleUtilisateur;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
            case EMPLOYE -> {
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
            }
                
            case MANAGER -> {
                Manager manager = new Manager();
                setCommonFields(manager, request);
                manager.setDepartementResponsable(request.getDepartementResponsable() != null 
                    ? request.getDepartementResponsable() 
                    : request.getDepartement());
                user = manager;
            }
                
            case RH -> {
                RH rh = new RH();
                setCommonFields(rh, request);
                rh.setService(request.getService() != null 
                    ? request.getService() 
                    : request.getDepartement());
                user = rh;
            }
                
            case CHEF_PROJET -> {
                ChefProjet chefProjet = new ChefProjet();
                setCommonFields(chefProjet, request);
                chefProjet.setDomaine(request.getDomaine() != null 
                    ? request.getDomaine() 
                    : request.getDepartement());
                user = chefProjet;
            }
                
            default -> {
                user = new Utilisateur();
                setCommonFields(user, request);
            }
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

    /**
     * Récupérer tous les utilisateurs
     */
    @PreAuthorize("hasRole('RH')")
    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    /**
     * Récupérer un utilisateur par ID
     */
    @PreAuthorize("hasRole('RH')")
    public Utilisateur getUserById(String userId) {
        return utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId));
    }

    /**
     * Mettre à jour un utilisateur
     */
    @PreAuthorize("hasRole('RH')")
    @Transactional
    public Utilisateur updateUser(String userId, UpdateUserRequest request, String updatedBy) {
        Utilisateur user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId));

        StringBuilder changes = new StringBuilder("Modifications: ");
        
        // Mettre à jour les champs communs si fournis
        if (request.getNom() != null && !request.getNom().equals(user.getNom())) {
            changes.append("nom (").append(user.getNom()).append(" -> ").append(request.getNom()).append("), ");
            user.setNom(request.getNom());
        }
        if (request.getPrenom() != null && !request.getPrenom().equals(user.getPrenom())) {
            changes.append("prénom (").append(user.getPrenom()).append(" -> ").append(request.getPrenom()).append("), ");
            user.setPrenom(request.getPrenom());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Vérifier que le nouvel email n'existe pas déjà
            if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Un utilisateur avec cet email existe déjà");
            }
            changes.append("email (").append(user.getEmail()).append(" -> ").append(request.getEmail()).append("), ");
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            changes.append("mot de passe réinitialisé, ");
        }
        if (request.getEnabled() != null && request.getEnabled() != user.isEnabled()) {
            changes.append("enabled (").append(user.isEnabled()).append(" -> ").append(request.getEnabled()).append("), ");
            user.setEnabled(request.getEnabled());
        }

        // Mettre à jour les champs spécifiques selon le type d'utilisateur
        if (user instanceof Employe) {
            Employe employe = (Employe) user;
            if (request.getMatricule() != null) employe.setMatricule(request.getMatricule());
            if (request.getPoste() != null) employe.setPoste(request.getPoste());
            if (request.getDepartement() != null) employe.setDepartement(request.getDepartement());
            if (request.getDateEmbauche() != null) employe.setDateEmbauche(request.getDateEmbauche());
            if (request.getNiveauExperience() != null) employe.setNiveauExperience(request.getNiveauExperience());
            if (request.getDisponibilite() != null) employe.setDisponibilite(request.getDisponibilite());
            if (request.getManagerId() != null) {
                managerRepository.findById(request.getManagerId()).ifPresent(employe::setManager);
            }
        } else if (user instanceof Manager) {
            Manager manager = (Manager) user;
            if (request.getDepartementResponsable() != null) {
                manager.setDepartementResponsable(request.getDepartementResponsable());
            }
        } else if (user instanceof RH) {
            RH rh = (RH) user;
            if (request.getService() != null) {
                rh.setService(request.getService());
            }
        } else if (user instanceof ChefProjet) {
            ChefProjet chefProjet = (ChefProjet) user;
            if (request.getDomaine() != null) {
                chefProjet.setDomaine(request.getDomaine());
            }
        }

        Utilisateur updated = utilisateurRepository.save(user);

        // Log la mise à jour
        auditLogService.logAction(updatedBy, "UPDATE_USER", "UTILISATEUR", 
            userId, changes.toString());

        // Notifier l'utilisateur modifié
        notificationService.createNotification(
            userId,
            "Profil mis à jour",
            "Votre profil a été modifié par " + updatedBy,
            "INFO"
        );

        return updated;
    }

    /**
     * Supprimer un utilisateur (soft delete)
     */
    @PreAuthorize("hasRole('RH')")
    @Transactional
    public void deleteUser(String userId, String deletedBy) {
        Utilisateur user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId));

        // Soft delete - désactiver le compte
        user.setEnabled(false);
        utilisateurRepository.save(user);

        // Log la suppression
        auditLogService.logAction(deletedBy, "DELETE_USER", "UTILISATEUR", 
            userId, "Utilisateur supprimé (soft delete): " + user.getEmail());

        // Notifier l'utilisateur
        notificationService.createNotification(
            userId,
            "Compte désactivé",
            "Votre compte a été désactivé par " + deletedBy,
            "WARNING"
        );
    }
}
