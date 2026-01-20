package com.skill.backend.controller;

import com.skill.backend.dto.CreateUserRequest;
import com.skill.backend.entity.Utilisateur;
import com.skill.backend.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Administration Utilisateurs", description = "Gestion des utilisateurs par les RH (Production)")
@SecurityRequirement(name = "bearerAuth")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @PostMapping
    @PreAuthorize("hasRole('RH')")
    @Operation(summary = "Créer un nouvel utilisateur",
               description = "Permet aux RH de créer un nouvel utilisateur avec le rôle approprié (EMPLOYE, MANAGER, RH, CHEF_PROJET)")
    public ResponseEntity<Utilisateur> createUser(
            @RequestBody CreateUserRequest request,
            Authentication authentication) {
        String createdBy = authentication.getName();
        return ResponseEntity.ok(userManagementService.createUser(request, createdBy));
    }

    @PutMapping("/{userId}/disable")
    @PreAuthorize("hasRole('RH')")
    @Operation(summary = "Désactiver un utilisateur",
               description = "Désactive un compte utilisateur (l'utilisateur ne pourra plus se connecter)")
    public ResponseEntity<Utilisateur> disableUser(
            @PathVariable String userId,
            Authentication authentication) {
        String disabledBy = authentication.getName();
        return ResponseEntity.ok(userManagementService.disableUser(userId, disabledBy));
    }

    @PutMapping("/{userId}/enable")
    @PreAuthorize("hasRole('RH')")
    @Operation(summary = "Réactiver un utilisateur",
               description = "Réactive un compte utilisateur précédemment désactivé")
    public ResponseEntity<Utilisateur> enableUser(
            @PathVariable String userId,
            Authentication authentication) {
        String enabledBy = authentication.getName();
        return ResponseEntity.ok(userManagementService.enableUser(userId, enabledBy));
    }
}
