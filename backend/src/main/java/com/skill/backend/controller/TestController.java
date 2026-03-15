package com.skill.backend.controller;

import com.skill.backend.dto.TestDTO;
import com.skill.backend.service.TestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@Tag(name = "Tests Techniques - Gestion", description = "Création et consultation des tests techniques")
@SecurityRequirement(name = "bearerAuth")
public class TestController {

    private final TestService testService;

    /**
     * POST /api/tests — Créer un test avec ses questions
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_RH')")
    @Operation(summary = "Créer un nouveau test technique avec questions")
    public ResponseEntity<TestDTO> createTest(@Valid @RequestBody TestDTO testDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(testService.createTest(testDTO));
    }

    /**
     * GET /api/tests — Lister tous les tests
     */
    @GetMapping
    @Operation(summary = "Lister tous les tests techniques")
    public ResponseEntity<List<TestDTO>> getAllTests() {
        return ResponseEntity.ok(testService.getAllTests());
    }

    /**
     * GET /api/tests/{id} — Récupérer un test par ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un test technique par ID")
    public ResponseEntity<TestDTO> getTestById(@PathVariable String id) {
        return ResponseEntity.ok(testService.getTestById(id));
    }
}
