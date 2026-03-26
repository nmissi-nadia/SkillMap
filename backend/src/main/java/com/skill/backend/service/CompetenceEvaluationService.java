package com.skill.backend.service;

import com.skill.backend.dto.CompetenceEmployeRequestDTO;
import com.skill.backend.dto.CompetenceEmployeDTO;
import com.skill.backend.dto.CompetenceDTO;
import com.skill.backend.dto.ManagerEvaluationRequestDTO;
import com.skill.backend.entity.Competence;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.entity.Employe;
import com.skill.backend.repository.CompetenceEmployeRepository;
import com.skill.backend.repository.CompetenceRepository;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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
    @Transactional
    public CompetenceEmployeDTO autoEvaluer(String employeId, CompetenceEmployeRequestDTO request) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employe", "id", employeId));
        
        Competence competence = competenceRepository.findById(request.getCompetenceId())
                .orElseThrow(() -> new ResourceNotFoundException("Competence", "id", request.getCompetenceId()));

        CompetenceEmploye competenceEmploye = competenceEmployeRepository.findByEmployeIdAndCompetenceId(employeId, request.getCompetenceId())
                .orElse(new CompetenceEmploye());

        if (competenceEmploye.getId() == null) {
            competenceEmploye.setEmploye(employe);
            competenceEmploye.setCompetence(competence);
        }
        
        competenceEmploye.setNiveauAuto(request.getNiveauAuto());
        competenceEmploye.setCommentaire(request.getCommentaire());
        competenceEmploye.setDateEvaluation(LocalDate.now());
        
        CompetenceEmploye saved = competenceEmployeRepository.save(competenceEmploye);

        auditLogService.logAutoEvaluation(employeId, competence.getId(), request.getNiveauAuto(), request.getCommentaire());

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
     * Évaluation directe par le manager
     */
    @Transactional
    public CompetenceEmployeDTO directEvaluate(String employeId, ManagerEvaluationRequestDTO request) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employe", "id", employeId));
        
        Competence competence = competenceRepository.findById(request.getCompetenceId())
                .orElseThrow(() -> new ResourceNotFoundException("Competence", "id", request.getCompetenceId()));

        CompetenceEmploye competenceEmploye = competenceEmployeRepository.findByEmployeIdAndCompetenceId(employeId, request.getCompetenceId())
                .orElse(new CompetenceEmploye());

        if (competenceEmploye.getId() == null) {
            competenceEmploye.setEmploye(employe);
            competenceEmploye.setCompetence(competence);
        }
        
        competenceEmploye.setNiveauManager(request.getNiveau());
        
        competenceEmploye.setCommentaire(request.getCommentaire());
        competenceEmploye.setDateEvaluation(LocalDate.now());
        
        CompetenceEmploye saved = competenceEmployeRepository.save(competenceEmploye);

        notificationService.notifyEmployeValidation(
            employe.getId(),
            competence.getNom(),
            true
        );

        return toDTO(saved);
    }

    /**
     * Validation d'une évaluation par le manager
     */
    @Transactional
    public CompetenceEmployeDTO validerEvaluation(String competenceEmployeId, int niveauManager, String commentaireManager) {
        CompetenceEmploye competenceEmploye = competenceEmployeRepository.findById(competenceEmployeId)
                .orElseThrow(() -> new ResourceNotFoundException("CompetenceEmploye", "id", competenceEmployeId));

        competenceEmploye.setNiveauManager(niveauManager);
        
        CompetenceEmploye updated = competenceEmployeRepository.save(competenceEmploye);

        auditLogService.logValidationManager(
            competenceEmploye.getEmploye().getManager().getId(),
            competenceEmployeId,
            niveauManager
        );

        notificationService.notifyEmployeValidation(
            competenceEmploye.getEmploye().getId(),
            competenceEmploye.getCompetence().getNom(),
            true
        );

        return toDTO(updated);
    }

    /**
     * Récupérer l'historique des évaluations d'un employé
     */
    @Transactional(readOnly = true)
    public List<CompetenceEmployeDTO> getHistory(String employeId) {
        return competenceEmployeRepository.findByEmployeId(employeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private CompetenceEmployeDTO toDTO(CompetenceEmploye entity) {
        CompetenceEmployeDTO dto = new CompetenceEmployeDTO();
        dto.setId(entity.getId());
        dto.setNiveauAuto(entity.getNiveauAuto());
        dto.setNiveauManager(entity.getNiveauManager());
        dto.setDateEvaluation(entity.getDateEvaluation());
        dto.setCommentaire(entity.getCommentaire());
        dto.setEmployeId(entity.getEmploye() != null ? entity.getEmploye().getId() : null);
        
        if (entity.getCompetence() != null) {
            dto.setCompetenceId(entity.getCompetence().getId());
            dto.setCompetenceNom(entity.getCompetence().getNom());
            
            CompetenceDTO compDto = new CompetenceDTO();
            compDto.setId(entity.getCompetence().getId());
            compDto.setNom(entity.getCompetence().getNom());
            compDto.setType(entity.getCompetence().getType());
            compDto.setDescription(entity.getCompetence().getDescription());
            dto.setCompetence(compDto);
        }
        
        return dto;
    }
}
