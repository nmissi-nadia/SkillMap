package com.skill.backend.controller;

import com.skill.backend.dto.AffectationProjetDTO;
import com.skill.backend.dto.ProjetDTO;
import com.skill.backend.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
@RequiredArgsConstructor
@Tag(name = "Projets", description = "Gestion des projets (Chef de Projet)")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    // =========================================================
    // PROJETS — endpoints chef de projet
    // =========================================================

    /**
     * Récupérer les projets du chef de projet connecté
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('CHEF_PROJET')")
    @Operation(summary = "Mes projets", description = "Retourne les projets gérés par le chef de projet connecté")
    public ResponseEntity<List<ProjetDTO>> getMesProjets() {
        System.out.println("🎯 ProjectController.getMesProjets - Request received");
        return ResponseEntity.ok(projectService.getMesProjets());
    }

    /**
     * Récupérer tous les projets (RH)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Tous les projets")
    public ResponseEntity<List<ProjetDTO>> getAllProjets() {
        System.out.println("🎯 ProjectController.getAllProjets - Request received");
        return ResponseEntity.ok(projectService.getAllProjets());
    }

    /**
     * Récupérer un projet par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Détails d'un projet")
    public ResponseEntity<ProjetDTO> getProjetById(@PathVariable String id) {
        return ResponseEntity.ok(projectService.getProjetById(id));
    }

    /**
     * Créer un nouveau projet
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Créer un projet")
    public ResponseEntity<ProjetDTO> createProjet(@RequestBody ProjetDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProjet(dto));
    }

    /**
     * Mettre à jour un projet
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Mettre à jour un projet")
    public ResponseEntity<ProjetDTO> updateProjet(
            @PathVariable String id,
            @RequestBody ProjetDTO dto) {
        return ResponseEntity.ok(projectService.updateProjet(id, dto));
    }

    /**
     * Supprimer un projet
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Supprimer un projet")
    public ResponseEntity<Void> deleteProjet(@PathVariable String id) {
        projectService.deleteProjet(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // ÉQUIPE — gestion des affectations
    // =========================================================

    /**
     * Récupérer les membres de l'équipe d'un projet
     */
    @GetMapping("/{projetId}/equipe")
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Équipe du projet", description = "Retourne les affectations actives pour un projet")
    public ResponseEntity<List<AffectationProjetDTO>> getEquipeProjet(@PathVariable String projetId) {
        return ResponseEntity.ok(projectService.getEquipeProjet(projetId));
    }

    /**
     * Affecter un employé à un projet
     */
    @PostMapping("/{projetId}/affecter")
    @PreAuthorize("hasRole('CHEF_PROJET')")
    @Operation(summary = "Affecter un employé", description = "Affecte un employé à un projet avec un rôle et taux d'allocation")
    public ResponseEntity<AffectationProjetDTO> affecterMembre(
            @PathVariable String projetId,
            @RequestBody AffectationProjetDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.affecterMembre(projetId, dto));
    }

    /**
     * Retirer un employé d'un projet
     */
    @DeleteMapping("/{projetId}/equipe/{employeId}")
    @PreAuthorize("hasRole('CHEF_PROJET')")
    @Operation(summary = "Retirer un membre", description = "Marque l'affectation comme TERMINEE")
    public ResponseEntity<Void> retirerMembre(
            @PathVariable String projetId,
            @PathVariable String employeId) {
        projectService.retirerMembre(projetId, employeId);
        return ResponseEntity.noContent().build();
    }
}
