package com.skill.backend.controller;

import com.skill.backend.dto.ResultatTestDTO;
import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.service.TestExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@Tag(name = "Tests Techniques - Passage", description = "Démarrage et soumission des tests")
@SecurityRequirement(name = "bearerAuth")
public class TestExecutionController {

    private final TestExecutionService testExecutionService;

    /**
     * POST /api/tests/{testEmployeId}/start — Démarrer un test (statut ASSIGNED → IN_PROGRESS)
     */
    @PostMapping("/{testEmployeId}/start")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Démarrer un test technique (ASSIGNED → IN_PROGRESS)")
    public ResponseEntity<TestEmployeDTO> startTest(@PathVariable String testEmployeId) {
        return ResponseEntity.ok(testExecutionService.startTest(testEmployeId));
    }

    /**
     * POST /api/tests/{testEmployeId}/submit — Soumettre les réponses
     * Body: Map<questionId, reponse>
     */
    @PostMapping("/{testEmployeId}/submit")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Soumettre les réponses d'un test pour évaluation automatique")
    public ResponseEntity<ResultatTestDTO> submitTest(
            @PathVariable String testEmployeId,
            @RequestBody Map<String, String> reponses) {
        return ResponseEntity.ok(testExecutionService.submitTest(testEmployeId, reponses));
    }
}
