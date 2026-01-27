package com.skill.backend.controller;

import com.skill.backend.dto.EmployeeMatchDTO;
import com.skill.backend.dto.EmployeeMatchDetailDTO;
import com.skill.backend.dto.MatchingAnalyticsDTO;
import com.skill.backend.service.SkillMatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
@Tag(name = "Skills Matching", description = "Matching automatique compétences ↔ projet")
@SecurityRequirement(name = "bearerAuth")
public class SkillMatchingController {

    private final SkillMatchingService skillMatchingService;

    /**
     * Trouver les meilleurs candidats pour un projet
     */
    @GetMapping("/project/{projetId}")
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Trouver les meilleurs employés pour un projet",
               description = "Algorithme de matching basé sur les compétences, priorités et disponibilité")
    public ResponseEntity<List<EmployeeMatchDTO>> findBestMatches(
            @PathVariable String projetId,
            @RequestParam(required = false, defaultValue = "50") Integer minScore) {
        return ResponseEntity.ok(skillMatchingService.findBestMatchesForProject(projetId, minScore));
    }

    /**
     * Détails du matching pour un employé spécifique
     */
    @GetMapping("/project/{projetId}/employee/{employeId}")
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Détails du matching pour un employé",
               description = "Analyse détaillée compétence par compétence")
    public ResponseEntity<EmployeeMatchDetailDTO> getMatchDetails(
            @PathVariable String projetId,
            @PathVariable String employeId) {
        return ResponseEntity.ok(skillMatchingService.getMatchDetails(projetId, employeId));
    }

    /**
     * Analytics du matching
     */
    @GetMapping("/project/{projetId}/analytics")
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    @Operation(summary = "Analytics du matching",
               description = "Statistiques et recommandations sur le matching")
    public ResponseEntity<MatchingAnalyticsDTO> getMatchingAnalytics(
            @PathVariable String projetId) {
        return ResponseEntity.ok(skillMatchingService.getMatchingAnalytics(projetId));
    }
}
