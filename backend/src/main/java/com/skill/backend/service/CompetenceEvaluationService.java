package com.skill.backend.service;

import com.skill.backend.dto.CompetenceEmployeRequestDTO;
import com.skill.backend.entity.Competence;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.entity.Employe;
import com.skill.backend.repository.CompetenceEmployeRepository;
import com.skill.backend.repository.CompetenceRepository;
import com.skill.backend.repository.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CompetenceEvaluationService {

    private final CompetenceEmployeRepository competenceEmployeRepository;
    private final EmployeRepository employeRepository;
    private final CompetenceRepository competenceRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Auto-évaluation d'une compétence par un employé
     */
    @PreAuthorize("hasRole('EMPLOYE')")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    public CompetenceEmploye autoEvaluer(String employeId, CompetenceEmployeRequestDTO request) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        Competence competence = competenceRepository.findById(request.getCompetenceId())
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));

        // Chercher si l'évaluation existe déjà ou créer une nouvelle
        CompetenceEmploye competenceEmploye = competenceEmployeRepository.findByEmployeIdAndCompetenceId(employeId, request.getCompetenceId())
                .orElse(new CompetenceEmploye());

        if (competenceEmploye.getId() == null) {
            competenceEmploye.setEmploye(employe);
            competenceEmploye.setCompetence(competence);
        }
        
        competenceEmploye.setNiveauAuto(request.getNiveauAuto());
        competenceEmploye.setCommentaire(request.getCommentaire());
        competenceEmploye.setDateEvaluation(java.time.LocalDate.now());
        
        CompetenceEmploye saved = competenceEmployeRepository.save(competenceEmploye);

        // Log l'auto-évaluation
        auditLogService.logAutoEvaluation(employeId, competence.getId(), request.getNiveauAuto(), request.getCommentaire());

        // Notifier le manager si l'employé en a un
        if (employe.getManager() != null) {
            notificationService.notifyManagerAutoEvaluation(
                employe.getManager().getId(),
                employe.getNom(),
                employe.getPrenom(),
                competence.getNom()
            );
        }

        return saved;
    }

    /**
     * Validation d'une évaluation par le manager
     */
    @PreAuthorize("hasRole('MANAGER')")
    public CompetenceEmploye validerEvaluation(String competenceEmployeId, int niveauManager, String commentaireManager) {
        CompetenceEmploye competenceEmploye = competenceEmployeRepository.findById(competenceEmployeId)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));

        competenceEmploye.setNiveauManager(niveauManager);
        
        CompetenceEmploye updated = competenceEmployeRepository.save(competenceEmploye);

        // Log la validation
        auditLogService.logValidationManager(
            competenceEmploye.getEmploye().getManager().getId(),
            competenceEmployeId,
            niveauManager
        );

        // Notifier l'employé
        notificationService.notifyEmployeValidation(
            competenceEmploye.getEmploye().getId(),
            competenceEmploye.getCompetence().getNom(),
            true
        );

        return updated;
    }
}
