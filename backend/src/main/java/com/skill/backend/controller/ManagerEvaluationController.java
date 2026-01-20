package com.skill.backend.controller;

import com.skill.backend.dto.ValidationEvaluationDTO;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.service.ManagerEvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/evaluations")
@RequiredArgsConstructor
@Tag(name = "Manager - Évaluations", description = "Validation des auto-évaluations par le manager")
@SecurityRequirement(name = "bearerAuth")
public class ManagerEvaluationController {

    private final ManagerEvaluationService managerEvaluationService;

    @GetMapping("/en-attente/{managerId}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Consulter les auto-évaluations en attente",
               description = "Récupère toutes les auto-évaluations des employés du manager en attente de validation")
    public ResponseEntity<List<CompetenceEmploye>> getEvaluationsEnAttente(@PathVariable String managerId) {
        return ResponseEntity.ok(managerEvaluationService.getEvaluationsEnAttente(managerId));
    }

    @PutMapping("/{competenceEmployeId}/valider")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Valider une auto-évaluation",
               description = "Valide et ajuste le niveau d'une auto-évaluation")
    public ResponseEntity<CompetenceEmploye> validerEvaluation(
            @PathVariable String competenceEmployeId,
            @RequestParam String managerId,
            @RequestBody ValidationEvaluationDTO request) {
        return ResponseEntity.ok(managerEvaluationService.validerEvaluation(
            competenceEmployeId, 
            request.getNiveauManager(), 
            request.getCommentaireManager(),
            managerId
        ));
    }

    @PutMapping("/{competenceEmployeId}/rejeter")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Rejeter une auto-évaluation",
               description = "Rejette une auto-évaluation avec commentaire")
    public ResponseEntity<CompetenceEmploye> rejeterEvaluation(
            @PathVariable String competenceEmployeId,
            @RequestParam String managerId,
            @RequestParam String commentaire) {
        return ResponseEntity.ok(managerEvaluationService.rejeterEvaluation(
            competenceEmployeId, 
            commentaire,
            managerId
        ));
    }
}
