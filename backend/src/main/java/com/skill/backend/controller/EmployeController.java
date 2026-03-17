package com.skill.backend.controller;

import com.skill.backend.dto.EmployeDTO;
import com.skill.backend.dto.UpdateEmployeRequest;
import com.skill.backend.entity.Employe;
import com.skill.backend.service.EmployeService;
import com.skill.backend.service.TestAssignmentService;
import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.dto.CompetenceEmployeDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/employes")
@RequiredArgsConstructor
@Tag(name = "Gestion des Employés", description = "Opérations CRUD pour les employés")
@SecurityRequirement(name = "bearerAuth")
public class EmployeController {

    private final EmployeService employeService;
    private final TestAssignmentService testAssignmentService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_RH', 'ROLE_MANAGER', 'ROLE_CHEF_PROJET', 'ROLE_EMPLOYE')")
    @Operation(summary = "Lister tous les employés",
               description = "Récupère la liste de tous les employés")
    public ResponseEntity<List<EmployeDTO>> getAllEmployes() {
        return ResponseEntity.ok(employeService.getAllEmployes());
    }

    @GetMapping("/{employeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_RH', 'ROLE_MANAGER', 'ROLE_CHEF_PROJET', 'ROLE_EMPLOYE')")
    @Operation(summary = "Récupérer un employé par ID",
               description = "Récupère les détails d'un employé spécifique")
    public ResponseEntity<EmployeDTO> getEmployeById(@PathVariable String employeId) {
        return ResponseEntity.ok(employeService.getEmployeById(employeId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYE', 'ROLE_MANAGER')")
    @Operation(summary = "Récupérer son propre profil",
               description = "Permet à un employé de récupérer son propre profil")
    public ResponseEntity<EmployeDTO> getMyProfile(Authentication authentication) {
        System.out.println("🎯 EmployeController.getMyProfile - Request received for: " + authentication.getName());
        System.out.println("🔑 Current user authorities: " + authentication.getAuthorities());
        System.out.println("👤 Authentication principal type: " + authentication.getPrincipal().getClass().getName());
        return ResponseEntity.ok(employeService.getMyProfile(authentication.getName()));
    }



    @GetMapping("/me/competences")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Récupérer ses compétences",
               description = "Permet à un employé de récupérer la liste de ses compétences")
    public ResponseEntity<List<CompetenceEmployeDTO>> getMyCompetencies(Authentication authentication) {
        return ResponseEntity.ok(employeService.getMyCompetencies(authentication.getName()));
    }

    @PutMapping("/{employeId}")
    @PreAuthorize("hasAuthority('ROLE_RH')")
    @Operation(summary = "Mettre à jour un employé",
               description = "Met à jour les informations d'un employé (RH uniquement)")
    public ResponseEntity<EmployeDTO> updateEmploye(
            @PathVariable String employeId,
            @RequestBody UpdateEmployeRequest request,
            Authentication authentication) {
        String updatedBy = authentication.getName();
        return ResponseEntity.ok(employeService.updateEmploye(employeId, request, updatedBy));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Mettre à jour son propre profil",
               description = "Permet à un employé de mettre à jour son propre profil (champs limités)")
    public ResponseEntity<EmployeDTO> updateMyProfile(
            @RequestBody UpdateEmployeRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(employeService.updateEmployeProfile(email, request));
    }

    @DeleteMapping("/{employeId}")
    @PreAuthorize("hasAuthority('ROLE_RH')")
    @Operation(summary = "Supprimer un employé",
               description = "Supprime un employé (soft delete - désactivation du compte)")
    public ResponseEntity<Void> deleteEmploye(
            @PathVariable String employeId,
            Authentication authentication) {
        String deletedBy = authentication.getName();
        employeService.deleteEmploye(employeId, deletedBy);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/tests")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYE', 'ROLE_MANAGER', 'ROLE_RH')")
    @Operation(summary = "Récupérer les tests d'un employé")
    public ResponseEntity<List<TestEmployeDTO>> getTestsForEmployee(@PathVariable String id) {
        System.out.println("🚀 [EmployeController] getTestsForEmployee called for ID: " + id);
        try {
            List<TestEmployeDTO> tests = testAssignmentService.getTestsForEmployee(id);
            System.out.println("✅ [EmployeController] tests found: " + tests.size());
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            System.err.println("❌ [EmployeController] Error in getTestsForEmployee: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
