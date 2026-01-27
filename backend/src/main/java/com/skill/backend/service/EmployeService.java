package com.skill.backend.service;

import com.skill.backend.dto.EmployeDTO;
import com.skill.backend.dto.UpdateEmployeRequest;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Manager;
import com.skill.backend.mapper.EmployeMapper;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.ManagerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des employés
 */
@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeRepository employeRepository;
    private final ManagerRepository managerRepository;
    private final EmployeMapper employeMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Récupérer tous les employés
     */
    @PreAuthorize("hasAnyRole('RH', 'MANAGER', 'CHEF_PROJET')")
    public List<EmployeDTO> getAllEmployes() {
        return employeRepository.findAll().stream()
            .map(employeMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Récupérer un employé par ID
     */
    @PreAuthorize("hasAnyRole('RH', 'MANAGER', 'CHEF_PROJET', 'EMPLOYE')")
    public EmployeDTO getEmployeById(String employeId) {
        Employe employe = employeRepository.findById(employeId)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + employeId));
        return employeMapper.toDto(employe);
    }

    /**
     * Mettre à jour un employé (par RH)
     */
    @PreAuthorize("hasRole('RH')")
    @Transactional
    public EmployeDTO updateEmploye(String employeId, UpdateEmployeRequest request, String updatedBy) {
        Employe employe = employeRepository.findById(employeId)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + employeId));

        StringBuilder changes = new StringBuilder("Modifications: ");

        // Mettre à jour les champs si fournis
        if (request.getNom() != null && !request.getNom().equals(employe.getNom())) {
            changes.append("nom (").append(employe.getNom()).append(" -> ").append(request.getNom()).append("), ");
            employe.setNom(request.getNom());
        }
        if (request.getPrenom() != null && !request.getPrenom().equals(employe.getPrenom())) {
            changes.append("prénom (").append(employe.getPrenom()).append(" -> ").append(request.getPrenom()).append("), ");
            employe.setPrenom(request.getPrenom());
        }
        if (request.getEmail() != null && !request.getEmail().equals(employe.getEmail())) {
            changes.append("email (").append(employe.getEmail()).append(" -> ").append(request.getEmail()).append("), ");
            employe.setEmail(request.getEmail());
        }
        if (request.getMatricule() != null) {
            changes.append("matricule, ");
            employe.setMatricule(request.getMatricule());
        }
        if (request.getPoste() != null) {
            changes.append("poste (").append(employe.getPoste()).append(" -> ").append(request.getPoste()).append("), ");
            employe.setPoste(request.getPoste());
        }
        if (request.getDepartement() != null) {
            changes.append("département (").append(employe.getDepartement()).append(" -> ").append(request.getDepartement()).append("), ");
            employe.setDepartement(request.getDepartement());
        }
        if (request.getDateEmbauche() != null) {
            employe.setDateEmbauche(request.getDateEmbauche());
        }
        if (request.getNiveauExperience() != null) {
            changes.append("niveau d'expérience (").append(employe.getNiveauExperience()).append(" -> ").append(request.getNiveauExperience()).append("), ");
            employe.setNiveauExperience(request.getNiveauExperience());
        }
        if (request.getDisponibilite() != null) {
            changes.append("disponibilité (").append(employe.isDisponibilite()).append(" -> ").append(request.getDisponibilite()).append("), ");
            employe.setDisponibilite(request.getDisponibilite());
        }
        if (request.getManagerId() != null) {
            Manager manager = managerRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager non trouvé avec l'ID: " + request.getManagerId()));
            employe.setManager(manager);
            changes.append("manager modifié, ");
        }

        Employe updated = employeRepository.save(employe);

        // Log la mise à jour
        auditLogService.logAction(updatedBy, "UPDATE_EMPLOYE", "EMPLOYE", 
            employeId, changes.toString());

        // Notifier l'employé
        notificationService.createNotification(
            employeId,
            "Profil mis à jour",
            "Votre profil a été modifié par " + updatedBy,
            "INFO"
        );

        // Notifier le manager si l'employé en a un
        if (employe.getManager() != null) {
            notificationService.createNotification(
                employe.getManager().getId(),
                "Profil employé mis à jour",
                "Le profil de " + employe.getPrenom() + " " + employe.getNom() + " a été modifié",
                "INFO"
            );
        }

        return employeMapper.toDto(updated);
    }

    /**
     * Mettre à jour son propre profil (par l'employé lui-même)
     */
    @PreAuthorize("hasRole('EMPLOYE')")
    @Transactional
    public EmployeDTO updateEmployeProfile(String employeId, UpdateEmployeRequest request, String currentUserId) {
        // Vérifier que l'employé modifie bien son propre profil
        if (!employeId.equals(currentUserId)) {
            throw new RuntimeException("Vous ne pouvez modifier que votre propre profil");
        }

        Employe employe = employeRepository.findById(employeId)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + employeId));

        StringBuilder changes = new StringBuilder("Auto-modification du profil: ");

        // Permettre uniquement certains champs pour l'auto-modification
        if (request.getPoste() != null) {
            changes.append("poste (").append(employe.getPoste()).append(" -> ").append(request.getPoste()).append("), ");
            employe.setPoste(request.getPoste());
        }
        if (request.getNiveauExperience() != null) {
            changes.append("niveau d'expérience (").append(employe.getNiveauExperience()).append(" -> ").append(request.getNiveauExperience()).append("), ");
            employe.setNiveauExperience(request.getNiveauExperience());
        }
        if (request.getDisponibilite() != null) {
            changes.append("disponibilité (").append(employe.isDisponibilite()).append(" -> ").append(request.getDisponibilite()).append("), ");
            employe.setDisponibilite(request.getDisponibilite());
        }

        Employe updated = employeRepository.save(employe);

        // Log la mise à jour
        auditLogService.logAction(currentUserId, "UPDATE_PROFILE", "EMPLOYE", 
            employeId, changes.toString());

        // Notifier le manager si l'employé en a un
        if (employe.getManager() != null) {
            notificationService.createNotification(
                employe.getManager().getId(),
                "Profil employé mis à jour",
                employe.getPrenom() + " " + employe.getNom() + " a mis à jour son profil",
                "INFO"
            );
        }

        return employeMapper.toDto(updated);
    }

    /**
     * Supprimer un employé (soft delete)
     */
    @PreAuthorize("hasRole('RH')")
    @Transactional
    public void deleteEmploye(String employeId, String deletedBy) {
        Employe employe = employeRepository.findById(employeId)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + employeId));

        // Soft delete - désactiver le compte
        employe.setEnabled(false);
        employeRepository.save(employe);

        // Log la suppression
        auditLogService.logAction(deletedBy, "DELETE_EMPLOYE", "EMPLOYE", 
            employeId, "Employé supprimé (soft delete): " + employe.getEmail());

        // Notifier l'employé
        notificationService.createNotification(
            employeId,
            "Compte désactivé",
            "Votre compte a été désactivé par " + deletedBy,
            "WARNING"
        );

        // Notifier le manager si l'employé en a un
        if (employe.getManager() != null) {
            notificationService.createNotification(
                employe.getManager().getId(),
                "Employé désactivé",
                "Le compte de " + employe.getPrenom() + " " + employe.getNom() + " a été désactivé",
                "WARNING"
            );
        }
    }
}
