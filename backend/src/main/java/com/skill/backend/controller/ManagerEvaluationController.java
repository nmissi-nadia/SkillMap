package com.skill.backend.controller;

import com.skill.backend.dto.EvaluationDTO;
import com.skill.backend.dto.ValidationEvaluationDTO;
import com.skill.backend.service.ManagerEvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/evaluations")
@RequiredArgsConstructor
@Tag(name = "Manager Evaluation", description = "Gestion des évaluations par les managers")
@SecurityRequirement(name = "bearerAuth")
public class ManagerEvaluationController {

    private final ManagerEvaluationService managerEvaluationService;

    /**
     * Récupérer les évaluations en attente de validation
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Récupérer les évaluations en attente")
    public ResponseEntity<List<EvaluationDTO>> getPendingEvaluations(Authentication authentication) {
        String managerId = authentication.getName();
        return ResponseEntity.ok(managerEvaluationService.getPendingEvaluations(managerId));
    }

    /**
     * Valider une évaluation
     */
    @PutMapping("/{evaluationId}/validate")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Valider une évaluation")
    public ResponseEntity<EvaluationDTO> validateEvaluation(
            @PathVariable String evaluationId,
            @RequestBody ValidationEvaluationDTO request,
            Authentication authentication) {
        String managerId = authentication.getName();
        return ResponseEntity.ok(managerEvaluationService.validateEvaluation(evaluationId, request, managerId));
    }

    /**
     * Ajuster le niveau d'une évaluation
     */
    @PutMapping("/{evaluationId}/adjust")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Ajuster le niveau d'une évaluation")
    public ResponseEntity<EvaluationDTO> adjustEvaluationLevel(
            @PathVariable String evaluationId,
            @RequestParam int newLevel,
            @RequestParam String justification,
            Authentication authentication) {
        String managerId = authentication.getName();
        return ResponseEntity.ok(managerEvaluationService.adjustEvaluationLevel(evaluationId, newLevel, justification, managerId));
    }

    /**
     * Récupérer l'historique des validations
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Historique des validations")
    public ResponseEntity<List<EvaluationDTO>> getValidationHistory(Authentication authentication) {
        String managerId = authentication.getName();
        // TODO: Implement history retrieval
        return ResponseEntity.ok(List.of());
    }
}

