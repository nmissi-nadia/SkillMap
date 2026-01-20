package com.skill.backend.controller;

import com.skill.backend.dto.TestTechniqueRequestDTO;
import com.skill.backend.dto.TestTechniqueResultDTO;
import com.skill.backend.entity.TestTechnique;
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
@RequestMapping("/api/tests-techniques")
@RequiredArgsConstructor
@Tag(name = "Tests Techniques", description = "Gestion des tests techniques")
@SecurityRequirement(name = "bearerAuth")
public class TestTechniqueController {

    private final TestTechniqueService testTechniqueService;

    @PostMapping("/assigner")
    @PreAuthorize("hasAnyRole('RH', 'MANAGER')")
    @Operation(summary = "Assigner un test technique",
               description = "Permet au RH ou Manager d'assigner un test technique à un employé")
    public ResponseEntity<TestTechnique> assignerTest(
            @RequestBody TestTechniqueRequestDTO request,
            Authentication authentication) {
        String assignedBy = authentication.getName(); // Email de l'utilisateur connecté
        return ResponseEntity.ok(testTechniqueService.assignerTest(request, assignedBy));
    }

    @PutMapping("/{testId}/resultat")
    @PreAuthorize("hasRole('EMPLOYE')")
    @Operation(summary = "Enregistrer le résultat d'un test",
               description = "Permet à un employé d'enregistrer le résultat de son test")
    public ResponseEntity<TestTechnique> enregistrerResultat(
            @PathVariable String testId,
            @RequestBody TestTechniqueResultDTO result) {
        return ResponseEntity.ok(testTechniqueService.enregistrerResultat(testId, result));
    }

    @GetMapping("/en-cours/{employeId}")
    @Operation(summary = "Récupérer les tests en cours",
               description = "Liste des tests en attente pour un employé")
    public ResponseEntity<List<TestTechnique>> getTestsEnCours(@PathVariable String employeId) {
        return ResponseEntity.ok(testTechniqueService.getTestsEnCours(employeId));
    }
}
