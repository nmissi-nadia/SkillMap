package com.skill.backend.controller;

import com.skill.backend.dto.CompetenceEmployeDTO;
import com.skill.backend.dto.EmployeDTO;
import com.skill.backend.dto.DirectEvaluationRequestDTO;
import com.skill.backend.dto.PendingEvaluationDTO;
import com.skill.backend.dto.TeamStatsDTO;
import com.skill.backend.dto.ValidationRequestDTO;
import com.skill.backend.dto.TestTechniqueDTO;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.service.ManagerService;
import com.skill.backend.service.TestTechniqueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/managers")
@RequiredArgsConstructor
@Tag(name = "Manager", description = "Endpoints pour les managers")
public class ManagerController {

    private final ManagerService managerService;
    private final TestTechniqueService testTechniqueService;

    @GetMapping("/me/team")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Récupérer la liste de son équipe",
               description = "Permet à un manager de récupérer la liste des employés sous sa responsabilité")
    public ResponseEntity<List<EmployeDTO>> getMyTeam(Authentication authentication) {
        System.out.println("🎯 ManagerController.getMyTeam - Request received for: " + authentication.getName());
        List<EmployeDTO> team = managerService.getMyTeam(authentication.getName());
        System.out.println("✅ Result: " + (team != null ? team.size() : 0) + " employees found.");
        return ResponseEntity.ok(team);
    }

    @GetMapping("/me/team/stats")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Récupérer les statistiques de l'équipe",
               description = "Permet à un manager de récupérer les statistiques globales de son équipe")
    public ResponseEntity<TeamStatsDTO> getTeamStats(Authentication authentication) {
        System.out.println("🎯 ManagerController.getTeamStats - Request received for: " + authentication.getName());
        TeamStatsDTO stats = managerService.getTeamStats(authentication.getName());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/me/team/{employeId}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Récupérer les détails d'un membre de l'équipe",
               description = "Permet à un manager de récupérer les détails d'un employé de son équipe")
    public ResponseEntity<EmployeDTO> getTeamMemberDetails(
            Authentication authentication,
            @PathVariable String employeId) {
        System.out.println("🎯 ManagerController.getTeamMemberDetails - Request for employee: " + employeId);
        EmployeDTO employe = managerService.getTeamMemberDetails(authentication.getName(), employeId);
        return ResponseEntity.ok(employe);
    }

    // ========== Évaluation des compétences ==========

    @GetMapping("/me/evaluations/pending")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Récupérer les évaluations en attente",
               description = "Permet à un manager de récupérer les auto-évaluations en attente de validation")
    public ResponseEntity<List<PendingEvaluationDTO>> getPendingEvaluations(Authentication authentication) {
        System.out.println("🎯 ManagerController.getPendingEvaluations - Request received for: " + authentication.getName());
        List<PendingEvaluationDTO> evaluations = managerService.getPendingEvaluations(authentication.getName());
        return ResponseEntity.ok(evaluations);
    }

    @PutMapping("/evaluations/{evaluationId}/validate")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Valider une évaluation",
               description = "Permet à un manager de valider ou ajuster une auto-évaluation")
    public ResponseEntity<CompetenceEmployeDTO> validateEvaluation(
            Authentication authentication,
            @PathVariable String evaluationId,
            @RequestBody ValidationRequestDTO request) {
        System.out.println("🎯 ManagerController.validateEvaluation - Validating evaluation: " + evaluationId);
        CompetenceEmployeDTO result = managerService.validateEvaluation(authentication.getName(), evaluationId, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/evaluations/history/{employeId}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Récupérer l'historique des évaluations",
               description = "Permet à un manager de consulter l'historique des évaluations d'un employé")
    public ResponseEntity<List<CompetenceEmployeDTO>> getEvaluationHistory(
            Authentication authentication,
            @PathVariable String employeId) {
        System.out.println("🎯 ManagerController.getEvaluationHistory - Request for employee: " + employeId);
        List<CompetenceEmployeDTO> history = managerService.getEvaluationHistory(authentication.getName(), employeId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/me/tests/assigned")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Récupérer les tests assignés",
               description = "Permet à un manager de récupérer la liste des tests qu'il a assignés")
    public ResponseEntity<List<com.skill.backend.dto.TestEmployeDTO>> getAssignedTests(Authentication authentication) {
        System.out.println("🎯 ManagerController.getAssignedTests - Request received for: " + authentication.getName());
        List<com.skill.backend.dto.TestEmployeDTO> tests = managerService.getAssignedTests(authentication.getName());
        System.out.println("✅ Result: " + tests.size() + " tests found.");
        return ResponseEntity.ok(tests);
    }


    @PostMapping("/me/team/{employeId}/evaluate")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Évaluer directement un membre de l'équipe",
               description = "Permet à un manager d'évaluer une compétence d'un employé sans passer par une auto-évaluation")
    public ResponseEntity<CompetenceEmployeDTO> evaluateMember(
            Authentication authentication,
            @PathVariable String employeId,
            @RequestBody DirectEvaluationRequestDTO request) {
        System.out.println("🎯 ManagerController.evaluateMember - Direct evaluation for employee: " + employeId);
        return ResponseEntity.ok(managerService.evaluateCompetenceDirectly(authentication.getName(), employeId, request));
    }


    @GetMapping("/me/available-employes")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Récupérer les employés disponibles",
               description = "Permet à un manager de récupérer la liste des employés sans manager")
    public ResponseEntity<List<EmployeDTO>> getAvailableEmployes() {
        return ResponseEntity.ok(managerService.getAvailableEmployes());
    }

    @PostMapping("/me/team/assign/{employeId}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Assigner un employé à son équipe",
               description = "Permet à un manager d'ajouter un employé à son équipe")
    public ResponseEntity<Void> assignEmployeToManager(
            Authentication authentication,
            @PathVariable String employeId) {
        managerService.assignEmployeToManager(authentication.getName(), employeId);
        return ResponseEntity.ok().build();
    }
}

