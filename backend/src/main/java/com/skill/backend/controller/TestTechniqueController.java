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

/**
 * Contrôleur legacy — maintenu pour compatibilité.
 * Les nouveaux clients doivent utiliser TestController, TestAssignmentController
 * et TestExecutionController.
 */
@RestController
@RequestMapping("/api/legacy/tests")
@RequiredArgsConstructor
@Tag(name = "Tests Techniques (Legacy)", description = "API legacy de gestion des tests — utiliser /api/tests pour les nouvelles fonctionnalités")
@SecurityRequirement(name = "bearerAuth")
public class TestTechniqueController {

    private final TestTechniqueService testTechniqueService;

    /**
     * Assigner un test technique à un employé (legacy)
     */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_RH', 'ROLE_MANAGER')")
    @Operation(summary = "[Legacy] Assigner un test technique")
    public ResponseEntity<TestTechniqueDTO> assignTest(
            @RequestBody AssignTestDTO request,
            Authentication authentication) {
        String assignedBy = authentication.getName();
        return ResponseEntity.ok(testTechniqueService.assignTest(request, assignedBy));
    }

    /**
     * Récupérer les tests actifs pour l'employé connecté (legacy)
     */
    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "[Legacy] Tests actifs de l'employé connecté")
    public ResponseEntity<List<TestTechniqueDTO>> getActiveTests(Authentication authentication) {
        String employeId = authentication.getName();
        return ResponseEntity.ok(testTechniqueService.getActiveTests(employeId));
    }

    /**
     * Récupérer tous les tests — Monitoring (legacy)
     */
    @GetMapping
    @Operation(summary = "[Legacy] Lister tous les tests")
    public ResponseEntity<List<TestTechniqueDTO>> getAllTests() {
        return ResponseEntity.ok(testTechniqueService.getAllTests());
    }

    /**
     * Récupérer un test par ID (legacy)
     */
    @GetMapping("/{id}")
    @Operation(summary = "[Legacy] Récupérer un test par ID")
    public ResponseEntity<TestTechniqueDTO> getTestById(@PathVariable String id) {
        return ResponseEntity.ok(testTechniqueService.getTestById(id));
    }
}
