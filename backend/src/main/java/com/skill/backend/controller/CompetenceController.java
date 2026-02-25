package com.skill.backend.controller;

import com.skill.backend.dto.CompetenceDTO;
import com.skill.backend.enums.TypeCompetence;
import com.skill.backend.service.CompetenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur pour la gestion du référentiel des compétences.
 */
@RestController
@RequestMapping("/api/competencies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompetenceController {

    private final CompetenceService competenceService;

    /**
     * Récupérer toutes les compétences (Public/Auth).
     */
    @GetMapping
    public ResponseEntity<List<CompetenceDTO>> getAllCompetencies() {
        return ResponseEntity.ok(competenceService.getAllCompetencies());
    }

    /**
     * Récupérer les compétences par type.
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<CompetenceDTO>> getByType(@PathVariable TypeCompetence type) {
        return ResponseEntity.ok(competenceService.getByType(type));
    }

    /**
     * Récupérer une compétence par ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompetenceDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(competenceService.getById(id));
    }

    /**
     * Créer une compétence (Admin/Manager/RH).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<CompetenceDTO> createCompetence(@RequestBody CompetenceDTO dto) {
        return new ResponseEntity<>(competenceService.createCompetence(dto), HttpStatus.CREATED);
    }

    /**
     * Mettre à jour une compétence (Admin/Manager/RH).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH', 'ADMIN')")
    public ResponseEntity<CompetenceDTO> updateCompetence(@PathVariable String id, @RequestBody CompetenceDTO dto) {
        return ResponseEntity.ok(competenceService.updateCompetence(id, dto));
    }

    /**
     * Supprimer une compétence (Admin/Manager/RH).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH', 'ADMIN')")
    public ResponseEntity<Void> deleteCompetence(@PathVariable String id) {
        competenceService.deleteCompetence(id);
        return ResponseEntity.noContent().build();
    }
}
