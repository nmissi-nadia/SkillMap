package com.skill.backend.controller;

import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.service.TestAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Tests Techniques - Affectation", description = "Affectation des tests aux employés")
@SecurityRequirement(name = "bearerAuth")
public class TestAssignmentController {

    private final TestAssignmentService testAssignmentService;

    /**
     * POST /api/tests/{testId}/assign/{employeId} — Affecter un test à un employé
     */
    @PostMapping("/api/tests/{testId}/assign/{employeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_RH')")
    @Operation(summary = "Affecter un test technique à un employé")
    public ResponseEntity<TestEmployeDTO> assignTest(
            @PathVariable String testId,
            @PathVariable String employeId,
            Authentication authentication) {
        String managerId = authentication.getName();
        return ResponseEntity.ok(testAssignmentService.assignTest(testId, employeId, managerId));
    }

    /**
     * GET /api/employes/{id}/tests — Récupérer tous les tests affectés à un employé
     */
    @GetMapping("/api/employes/{id}/tests")
    @Operation(summary = "Récupérer les tests d'un employé")
    public ResponseEntity<List<TestEmployeDTO>> getTestsForEmployee(@PathVariable String id) {
        return ResponseEntity.ok(testAssignmentService.getTestsForEmployee(id));
    }
}
