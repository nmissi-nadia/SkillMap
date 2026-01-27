package com.skill.backend.service;

import com.skill.backend.dto.EvaluationDTO;
import com.skill.backend.dto.ValidationEvaluationDTO;
import com.skill.backend.entity.Evaluation;
import com.skill.backend.entity.Manager;
import com.skill.backend.repository.EvaluationRepository;
import com.skill.backend.repository.ManagerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerEvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final ManagerRepository managerRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Récupérer les évaluations en attente de validation pour un manager
     */
    @PreAuthorize("hasRole('MANAGER')")
    public List<EvaluationDTO> getPendingEvaluations(String managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager non trouvé"));
        
        return evaluationRepository.findByManagerAndStatut(manager, "EN_ATTENTE").stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Valider une évaluation
     */
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional
    public EvaluationDTO validateEvaluation(String evaluationId, ValidationEvaluationDTO request, String managerId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));
        
        // Vérifier que le manager est bien le manager de l'employé
        if (!evaluation.getManager().getId().equals(managerId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à valider cette évaluation");
        }
        
        // Déterminer si c'est un ajustement
        boolean isAdjustment = !evaluation.getNiveauAutoEvalue().equals(request.getNiveauValide());
        
        // Mettre à jour l'évaluation
        evaluation.setNiveauValide(request.getNiveauValide());
        evaluation.setCommentaireManager(request.getCommentaireManager());
        evaluation.setStatut(isAdjustment ? "AJUSTEE" : "VALIDEE");
        evaluation.setDateValidation(LocalDateTime.now());
        
        Evaluation saved = evaluationRepository.save(evaluation);
        
        // Audit log
        String details = String.format("Évaluation %s - Niveau auto: %d, Niveau validé: %d",
                isAdjustment ? "ajustée" : "validée",
                evaluation.getNiveauAutoEvalue(),
                request.getNiveauValide());
        auditLogService.logAction(managerId, "VALIDATE_EVALUATION", "EVALUATION", evaluationId, details);
        
        // Notification à l'employé
        String notificationMessage = isAdjustment
                ? String.format("Votre auto-évaluation pour %s a été ajustée par votre manager (niveau: %d)",
                        evaluation.getCompetence().getNom(), request.getNiveauValide())
                : String.format("Votre auto-évaluation pour %s a été validée par votre manager",
                        evaluation.getCompetence().getNom());
        
        notificationService.sendNotification(
                evaluation.getEmploye().getId(),
                "Évaluation validée",
                notificationMessage
        );
        
        return toDTO(saved);
    }

    /**
     * Ajuster le niveau d'une évaluation
     */
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional
    public EvaluationDTO adjustEvaluationLevel(String evaluationId, int newLevel, String justification, String managerId) {
        ValidationEvaluationDTO request = new ValidationEvaluationDTO();
        request.setNiveauValide(newLevel);
        request.setCommentaireManager(justification);
        request.setAjustement(true);
        
        return validateEvaluation(evaluationId, request, managerId);
    }

    /**
     * Convertir Evaluation en DTO
     */
    private EvaluationDTO toDTO(Evaluation evaluation) {
        EvaluationDTO dto = new EvaluationDTO();
        dto.setId(evaluation.getId());
        dto.setType(evaluation.getType());
        dto.setScore(evaluation.getScore());
        dto.setCommentaire(evaluation.getCommentaire());
        dto.setDateEvaluation(evaluation.getDateEvaluation());
        
        if (evaluation.getEmploye() != null) {
            dto.setEmployeId(evaluation.getEmploye().getId());
            dto.setEmployeNom(evaluation.getEmploye().getNom() + " " + evaluation.getEmploye().getPrenom());
        }
        
        if (evaluation.getManager() != null) {
            dto.setManagerId(evaluation.getManager().getId());
            dto.setManagerNom(evaluation.getManager().getNom() + " " + evaluation.getManager().getPrenom());
        }
        
        if (evaluation.getCompetence() != null) {
            dto.setCompetenceId(evaluation.getCompetence().getId());
            dto.setCompetenceNom(evaluation.getCompetence().getNom());
        }
        
        dto.setNiveauAutoEvalue(evaluation.getNiveauAutoEvalue());
        dto.setNiveauValide(evaluation.getNiveauValide());
        dto.setCommentaireEmploye(evaluation.getCommentaireEmploye());
        dto.setCommentaireManager(evaluation.getCommentaireManager());
        dto.setStatut(evaluation.getStatut());
        dto.setDateValidation(evaluation.getDateValidation());
        
        return dto;
    }
}
