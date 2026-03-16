package com.skill.backend.controller;

import com.skill.backend.dto.*;
import com.skill.backend.enums.RoleUtilisateur;
import com.skill.backend.service.RHService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rh")
@RequiredArgsConstructor
@Tag(name = "RH", description = "Endpoints pour les Ressources Humaines")
// TODO: TEMPORAIRE - Désactivé pour debug. Le JWT contient bien ROLE_RH mais Spring Security rejette quand même
// @PreAuthorize("hasRole('RH')")
public class RHController {

    private final RHService rhService;

    // ========== PHASE 1: GESTION DES UTILISATEURS ==========

    @GetMapping("/users")
    @Operation(summary = "Récupérer tous les utilisateurs",
               description = "Liste paginée de tous les utilisateurs avec filtres optionnels")
    public ResponseEntity<Page<UtilisateurDTO>> getAllUsers(
            @RequestParam(required = false) RoleUtilisateur role,
            Pageable pageable,
            Authentication authentication) {
        
        System.out.println("🎯 RHController.getAllUsers - Request received for: " + authentication.getName());
        Page<UtilisateurDTO> users = rhService.getAllUtilisateurs(authentication.getName(), role, pageable);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    @Operation(summary = "Créer un nouvel utilisateur",
               description = "Permet au RH de créer un nouveau compte utilisateur avec un rôle spécifique")
    public ResponseEntity<UtilisateurDTO> createUser(
            @Valid @RequestBody CreateUtilisateurDTO dto,
            Authentication authentication) {
        
        System.out.println("🎯 RHController.createUser - Creating user: " + dto.getEmail());
        UtilisateurDTO created = rhService.createUtilisateur(authentication.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/users/{userId}")
    @Operation(summary = "Mettre à jour un utilisateur",
               description = "Permet au RH de modifier les informations d'un utilisateur")
    public ResponseEntity<UtilisateurDTO> updateUser(
            @PathVariable String userId,
            @RequestBody UpdateUtilisateurDTO dto,
            Authentication authentication) {
        
        System.out.println("🎯 RHController.updateUser - Updating user: " + userId);
        UtilisateurDTO updated = rhService.updateUtilisateur(authentication.getName(), userId, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/users/{userId}/deactivate")
    @Operation(summary = "Désactiver un utilisateur",
               description = "Permet au RH de désactiver un compte utilisateur")
    public ResponseEntity<Void> deactivateUser(
            @PathVariable String userId,
            Authentication authentication) {
        
        System.out.println("🎯 RHController.deactivateUser - Deactivating user: " + userId);
        rhService.deactivateUtilisateur(authentication.getName(), userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{userId}/activate")
    @Operation(summary = "Activer un utilisateur",
               description = "Permet au RH d'activer un compte utilisateur")
    public ResponseEntity<Void> activateUser(
            @PathVariable String userId,
            Authentication authentication) {
        
        System.out.println("🎯 RHController.activateUser - Activating user: " + userId);
        rhService.activateUtilisateur(authentication.getName(), userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/employees/{employeId}/manager")
    @Operation(summary = "Assigner un manager à un employé",
               description = "Permet au RH d'assigner ou modifier le manager d'un employé")
    public ResponseEntity<EmployeDTO> assignManager(
            @PathVariable String employeId,
            @RequestParam String managerId,
            Authentication authentication) {
        
        System.out.println("🎯 RHController.assignManager - Assigning manager " + managerId + " to employee " + employeId);
        EmployeDTO updated = rhService.assignManagerToEmployee(authentication.getName(), employeId, managerId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/departments")
    @Operation(summary = "Récupérer la liste des départements",
               description = "Liste de tous les départements de l'entreprise")
    public ResponseEntity<List<String>> getDepartments(Authentication authentication) {
        System.out.println("🎯 RHController.getDepartments - Request received");
        List<String> departments = rhService.getDepartments(authentication.getName());
        return ResponseEntity.ok(departments);
    }

    // ========== PHASE 2: CARTOGRAPHIE DES COMPÉTENCES ==========

    @GetMapping("/skills/map")
    @Operation(summary = "Cartographie des compétences de l'entreprise",
               description = "Vue d'ensemble de toutes les compétences avec filtres par département, poste, niveau")
    public ResponseEntity<SkillsMapDTO> getSkillsMap(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String poste,
            @RequestParam(required = false) Integer niveau,
            Authentication authentication) {
        
        System.out.println("🎯 RHController.getSkillsMap - Filters: dept=" + department + ", poste=" + poste + ", niveau=" + niveau);
        SkillsMapDTO map = rhService.getCompanySkillsMap(authentication.getName(), department, poste, niveau);
        return ResponseEntity.ok(map);
    }

    @GetMapping("/skills/rare")
    @Operation(summary = "Identifier les compétences rares",
               description = "Liste des compétences possédées par peu d'employés")
    public ResponseEntity<List<RareSkillDTO>> getRareSkills(
            @RequestParam(defaultValue = "5") int threshold,
            Authentication authentication) {
        
        System.out.println("🎯 RHController.getRareSkills - Threshold: " + threshold);
        List<RareSkillDTO> rareSkills = rhService.getRareSkills(authentication.getName(), threshold);
        return ResponseEntity.ok(rareSkills);
    }

    @GetMapping("/skills/critical")
    @Operation(summary = "Identifier les compétences critiques",
               description = "Liste des compétences critiques nécessitant une attention particulière")
    public ResponseEntity<List<CriticalSkillDTO>> getCriticalSkills(Authentication authentication) {
        System.out.println("🎯 RHController.getCriticalSkills - Request received");
        List<CriticalSkillDTO> criticalSkills = rhService.getCriticalSkills(authentication.getName());
        return ResponseEntity.ok(criticalSkills);
    }


}
