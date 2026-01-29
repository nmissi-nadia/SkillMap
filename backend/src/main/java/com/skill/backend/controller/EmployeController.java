package com.skill.backend.controller;

import com.skill.backend.dto.EmployeDTO;
import com.skill.backend.dto.UpdateEmployeRequest;
import com.skill.backend.entity.Employe;
import com.skill.backend.service.EmployeService;
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
@RequestMapping("/api/employes")
@RequiredArgsConstructor
@Tag(name = "Gestion des Employés", description = "Opérations CRUD pour les employés")
@SecurityRequirement(name = "bearerAuth")
public class EmployeController {

    private final EmployeService employeService;

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
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Récupérer son propre profil",
               description = "Permet à un employé de récupérer son propre profil")
    public ResponseEntity<EmployeDTO> getMyProfile(Authentication authentication) {
        System.out.println("🎯 EmployeController.getMyProfile - Request received for: " + authentication.getName());
        return ResponseEntity.ok(employeService.getMyProfile(authentication.getName()));
    }

    @GetMapping("/me/competences")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYE')")
    @Operation(summary = "Récupérer ses compétences",
               description = "Permet à un employé de récupérer la liste de ses compétences")
    public ResponseEntity<List<com.skill.backend.dto.CompetenceEmployeDTO>> getMyCompetencies(Authentication authentication) {
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
}
