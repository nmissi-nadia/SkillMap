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
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    public com.skill.backend.dto.CompetenceEmployeDTO autoEvaluer(String employeId, CompetenceEmployeRequestDTO request) {
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


        return toDTO(saved);
    }

    /**
     * Validation d'une évaluation par le manager
     */
    @PreAuthorize("hasRole('MANAGER')")
    public com.skill.backend.dto.CompetenceEmployeDTO validerEvaluation(String competenceEmployeId, int niveauManager, String commentaireManager) {
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

        return toDTO(updated);
    }

    private com.skill.backend.dto.CompetenceEmployeDTO toDTO(CompetenceEmploye entity) {
        com.skill.backend.dto.CompetenceEmployeDTO dto = new com.skill.backend.dto.CompetenceEmployeDTO();
        dto.setId(entity.getId());
        dto.setNiveauAuto(entity.getNiveauAuto());
        dto.setNiveauManager(entity.getNiveauManager());
        dto.setDateEvaluation(entity.getDateEvaluation());
        dto.setCommentaire(entity.getCommentaire());
        dto.setEmployeId(entity.getEmploye() != null ? entity.getEmploye().getId() : null);
        
        if (entity.getCompetence() != null) {
            dto.setCompetenceId(entity.getCompetence().getId());
            dto.setCompetenceNom(entity.getCompetence().getNom());
            
            com.skill.backend.dto.CompetenceDTO compDto = new com.skill.backend.dto.CompetenceDTO();
            compDto.setId(entity.getCompetence().getId());
            compDto.setNom(entity.getCompetence().getNom());
            compDto.setType(entity.getCompetence().getType());
            compDto.setDescription(entity.getCompetence().getDescription());
            dto.setCompetence(compDto);
        }
        
        return dto;
    }
}
