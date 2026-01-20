package com.skill.backend.service;

import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.repository.CompetenceEmployeRepository;
import com.skill.backend.repository.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerEvaluationService {

    private final CompetenceEmployeRepository competenceEmployeRepository;
    private final EmployeRepository employeRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Récupérer les auto-évaluations en attente de validation pour un manager
     */
    @PreAuthorize("hasRole('MANAGER')")
    public List<CompetenceEmploye> getEvaluationsEnAttente(String managerId) {
        // Récupérer tous les employés du manager
        return employeRepository.findByManagerId(managerId).stream()
                .flatMap(employe -> competenceEmployeRepository.findByEmploye(employe).stream())
                .filter(ce -> ce.getNiveauAuto() > 0 && ce.getNiveauManager() == 0)
                .collect(Collectors.toList());
    }

    /**
     * Valider une auto-évaluation avec ajustement du niveau
     */
    @PreAuthorize("hasRole('MANAGER')")
    public CompetenceEmploye validerEvaluation(String competenceEmployeId, int niveauManager, String commentaireManager, String managerId) {
        CompetenceEmploye competenceEmploye = competenceEmployeRepository.findById(competenceEmployeId)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));

        // Sauvegarder l'ancien état pour l'audit
        int ancienNiveau = competenceEmploye.getNiveauManager();
        
        // Mettre à jour
        competenceEmploye.setNiveauManager(niveauManager);
        
        CompetenceEmploye updated = competenceEmployeRepository.save(competenceEmploye);

        // Log la validation
        auditLogService.logValidationManager(managerId, competenceEmployeId, niveauManager);

        // Notifier l'employé
        notificationService.notifyEmployeValidation(
            competenceEmploye.getEmploye().getId(),
            competenceEmploye.getCompetence().getNom(),
            true
        );

        return updated;
    }

    /**
     * Rejeter une auto-évaluation
     */
    @PreAuthorize("hasRole('MANAGER')")
    public CompetenceEmploye rejeterEvaluation(String competenceEmployeId, String commentaireManager, String managerId) {
        CompetenceEmploye competenceEmploye = competenceEmployeRepository.findById(competenceEmployeId)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));

        // Réinitialiser le niveau auto
        competenceEmploye.setNiveauAuto(0);
        
        CompetenceEmploye updated = competenceEmployeRepository.save(competenceEmploye);

        // Log le rejet
        auditLogService.logAction(managerId, "REJECT_EVALUATION", "COMPETENCE_EMPLOYE", 
            competenceEmployeId, commentaireManager);

        // Notifier l'employé
        notificationService.notifyEmployeValidation(
            competenceEmploye.getEmploye().getId(),
            competenceEmploye.getCompetence().getNom(),
            false
        );

        return updated;
    }
}
