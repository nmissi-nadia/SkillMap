package com.skill.backend.controller;

import com.skill.backend.dto.EmployeDTO;
import com.skill.backend.dto.UpdateEmployeRequest;
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
    @PreAuthorize("hasAnyRole('RH', 'MANAGER', 'CHEF_PROJET')")
    @Operation(summary = "Lister tous les employés",
               description = "Récupère la liste de tous les employés (accessible par RH, Manager, Chef de Projet)")
    public ResponseEntity<List<EmployeDTO>> getAllEmployes() {
        return ResponseEntity.ok(employeService.getAllEmployes());
    }

    @GetMapping("/{employeId}")
    @PreAuthorize("hasAnyRole('RH', 'MANAGER', 'CHEF_PROJET', 'EMPLOYE')")
    @Operation(summary = "Récupérer un employé par ID",
               description = "Récupère les détails d'un employé spécifique")
    public ResponseEntity<EmployeDTO> getEmployeById(@PathVariable String employeId) {
        return ResponseEntity.ok(employeService.getEmployeById(employeId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYE')")
    @Operation(summary = "Récupérer son propre profil",
               description = "Permet à un employé de récupérer son propre profil")
    public ResponseEntity<EmployeDTO> getMyProfile(Authentication authentication) {
        String currentUserId = authentication.getName();
        return ResponseEntity.ok(employeService.getEmployeById(currentUserId));
    }

    @PutMapping("/{employeId}")
    @PreAuthorize("hasRole('RH')")
    @Operation(summary = "Mettre à jour un employé",
               description = "Met à jour les informations d'un employé (RH uniquement)")
    public ResponseEntity<EmployeDTO> updateEmploye(
            @PathVariable String employeId,
            @RequestBody UpdateEmployeRequest request,
            Authentication authentication) {
        String updatedBy = authentication.getName();
        return ResponseEntity.ok(employeService.updateEmploye(employeId, request, updatedBy));
    }

    @PutMapping("/{employeId}/profile")
    @PreAuthorize("hasRole('EMPLOYE')")
    @Operation(summary = "Mettre à jour son propre profil",
               description = "Permet à un employé de mettre à jour son propre profil (champs limités)")
    public ResponseEntity<EmployeDTO> updateMyProfile(
            @PathVariable String employeId,
            @RequestBody UpdateEmployeRequest request,
            Authentication authentication) {
        String currentUserId = authentication.getName();
        return ResponseEntity.ok(employeService.updateEmployeProfile(employeId, request, currentUserId));
    }

    @DeleteMapping("/{employeId}")
    @PreAuthorize("hasRole('RH')")
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
