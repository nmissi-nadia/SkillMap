package com.skill.backend.controller;

import com.skill.backend.dto.CompetenceEmployeRequestDTO;
import com.skill.backend.dto.ValidationEvaluationDTO;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.service.CompetenceEvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations/competences")
@RequiredArgsConstructor
@Tag(name = "Évaluations Compétences", description = "Gestion des auto-évaluations et validations")
@SecurityRequirement(name = "bearerAuth")
public class CompetenceEvaluationController {

    private final CompetenceEvaluationService competenceEvaluationService;

    @PostMapping("/auto/{employeId}")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Auto-évaluation d'une compétence", 
               description = "Permet à un employé de s'auto-évaluer sur une compétence (niveau 1-5)")
    public ResponseEntity<com.skill.backend.dto.CompetenceEmployeDTO> autoEvaluer(
            @PathVariable String employeId,
            @RequestBody CompetenceEmployeRequestDTO request) {
        return ResponseEntity.ok(competenceEvaluationService.autoEvaluer(employeId, request));
    }

    @PutMapping("/{competenceEmployeId}/validate")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    @Operation(summary = "Validation manager d'une évaluation",
               description = "Permet au manager de valider et noter l'auto-évaluation d'un employé")
    public ResponseEntity<com.skill.backend.dto.CompetenceEmployeDTO> validateEvaluation(
            @PathVariable String competenceEmployeId,
            @RequestBody ValidationEvaluationDTO request) {
        return ResponseEntity.ok(competenceEvaluationService.validerEvaluation(
            competenceEmployeId, 
            request.getNiveauValide() != null ? request.getNiveauValide() : 0, 
            request.getCommentaireManager()
        ));
    }

    @GetMapping("/{employeId}/history")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYE')")
    @Operation(summary = "Récupérer l'historique des évaluations",
               description = "Permet de consulter l'historique des évaluations d'un employé")
    public ResponseEntity<List<com.skill.backend.dto.CompetenceEmployeDTO>> getHistory(@PathVariable String employeId) {
        return ResponseEntity.ok(competenceEvaluationService.getHistory(employeId));
    }
}
