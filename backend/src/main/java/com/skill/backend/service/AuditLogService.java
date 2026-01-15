package com.skill.backend.service;

import com.skill.backend.entity.AuditLog;
import com.skill.backend.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Log une action d'authentification
     */
    public void logAuthentication(String userId, String action, boolean success) {
        AuditLog log = new AuditLog();
        log.setAction(action + (success ? "_SUCCESS" : "_FAILURE"));
        log.setEntite("AUTHENTICATION");
        log.setUtilisateurId(userId);
        log.setDateAction(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    /**
     * Log une action générique avec ancien et nouvel état
     */
    public void logAction(String userId, String action, String entity, Object oldState, Object newState) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntite(entity);
            log.setUtilisateurId(userId);
            log.setAncienEtat(oldState != null ? objectMapper.writeValueAsString(oldState) : null);
            log.setNouvelEtat(newState != null ? objectMapper.writeValueAsString(newState) : null);
            log.setDateAction(LocalDateTime.now());
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }

    /**
     * Log une modification de profil
     */
    public void logProfilUpdate(String userId, String employeId, Object oldProfil, Object newProfil) {
        logAction(userId, "UPDATE_PROFIL", "EMPLOYE:" + employeId, oldProfil, newProfil);
    }

    /**
     * Log une auto-évaluation
     */
    public void logAutoEvaluation(String userId, String competenceId, int niveau, String commentaire) {
        String details = String.format("Compétence: %s, Niveau: %d, Commentaire: %s", 
            competenceId, niveau, commentaire);
        logAction(userId, "AUTO_EVALUATION", "COMPETENCE", null, details);
    }

    /**
     * Log une validation manager
     */
    public void logValidationManager(String managerId, String competenceEmployeId, int niveauManager) {
        String details = String.format("CompetenceEmploye: %s, Niveau Manager: %d", 
            competenceEmployeId, niveauManager);
        logAction(managerId, "VALIDATION_MANAGER", "COMPETENCE_EMPLOYE", null, details);
    }
}
