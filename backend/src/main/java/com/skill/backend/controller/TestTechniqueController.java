package com.skill.backend.controller;

import com.skill.backend.dto.AssignTestDTO;
import com.skill.backend.dto.SubmitTestDTO;
import com.skill.backend.dto.TestTechniqueDTO;
import com.skill.backend.service.TestTechniqueService;
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
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@Tag(name = "Tests Techniques", description = "Gestion des tests techniques")
@SecurityRequirement(name = "bearerAuth")
public class TestTechniqueController {

    private final TestTechniqueService testTechniqueService;

    /**
     * Assigner un test technique à un employé
     */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_RH', 'ROLE_MANAGER')")
    @Operation(summary = "Assigner un test technique")
    public ResponseEntity<TestTechniqueDTO> assignTest(
            @RequestBody AssignTestDTO request,
            Authentication authentication) {
        String assignedBy = authentication.getName();
        return ResponseEntity.ok(testTechniqueService.assignTest(request, assignedBy));
    }

    /**
     * Récupérer les tests actifs pour un employé
     */
    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Tests actifs de l'employé connecté")
    public ResponseEntity<List<TestTechniqueDTO>> getActiveTests(Authentication authentication) {
        String employeId = authentication.getName();
        return ResponseEntity.ok(testTechniqueService.getActiveTests(employeId));
    }

    /**
     * Soumettre les réponses d'un test
     */
    @PostMapping("/{testId}/submit")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Soumettre les réponses d'un test")
    public ResponseEntity<TestTechniqueDTO> submitTest(
            @PathVariable String testId,
            @RequestBody SubmitTestDTO answers,
            Authentication authentication) {
        String employeId = authentication.getName();
        return ResponseEntity.ok(testTechniqueService.submitTest(testId, answers, employeId));
    }

    /**
     * Récupérer le résultat d'un test
     */
    @GetMapping("/{testId}/result")
    @Operation(summary = "Résultat d'un test")
    public ResponseEntity<TestTechniqueDTO> getTestResult(@PathVariable String testId) {
        // TODO: Implement getTestById in service
        return ResponseEntity.ok(new TestTechniqueDTO());
    }

    /**
     * Monitoring des tests (RH)
     */
    @GetMapping("/monitoring")
    @PreAuthorize("hasAuthority('ROLE_RH')")
    @Operation(summary = "Monitoring des tests pour RH")
    public ResponseEntity<List<TestTechniqueDTO>> getTestsMonitoring() {
        // TODO: Implement monitoring in service
        return ResponseEntity.ok(List.of());
    }
}
