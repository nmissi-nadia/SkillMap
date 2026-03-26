package com.skill.backend.controller;

import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.service.TestAssignmentService;
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
@Tag(name = "Tests Techniques - Affectation", description = "Affectation des tests aux employés")
@SecurityRequirement(name = "bearerAuth")
public class TestAssignmentController {

    private final TestAssignmentService testAssignmentService;

    /**
     * POST /api/tests/assign — Affecter un test à un employé
     */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_RH')")
    @Operation(summary = "Affecter un test technique à un employé")
    public ResponseEntity<TestEmployeDTO> assignTest(
            @RequestBody com.skill.backend.dto.TestAssignmentRequestDTO request,
            Authentication authentication) {
        String managerEmail = authentication.getName();
        return ResponseEntity.ok(testAssignmentService.assignTest(
            request.getTestId(), 
            request.getEmployeId(), 
            managerEmail, 
            request.getDateLimite()
        ));
    }
}
