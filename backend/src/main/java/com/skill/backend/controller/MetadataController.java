package com.skill.backend.controller;

import com.skill.backend.dto.MetadataDTO;
import com.skill.backend.enums.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/metadata")
@Tag(name = "Metadata", description = "Récupération des énumérations et libellés dynamiques")
public class MetadataController {

    @GetMapping
    @Operation(summary = "Récupérer toutes les métadonnées (rôles, statuts, niveaux)")
    public ResponseEntity<MetadataDTO> getMetadata() {
        return ResponseEntity.ok(MetadataDTO.builder()
                .roles(Arrays.stream(RoleUtilisateur.values())
                        .map(r -> Map.of("value", r.name(), "label", getRoleLabel(r)))
                        .collect(Collectors.toList()))
                .formationTypes(Arrays.stream(TypeFormation.values())
                        .map(t -> Map.of("value", t.name(), "label", getFormationTypeLabel(t)))
                        .collect(Collectors.toList()))
                .formationStatuts(List.of(
                        Map.of("value", "PLANIFIEE", "label", "Planifiée"),
                        Map.of("value", "EN_COURS", "label", "En cours"),
                        Map.of("value", "TERMINEE", "label", "Terminée"),
                        Map.of("value", "ANNULEE", "label", "Annulée")
                ))
                .projetStatuts(List.of(
                        Map.of("value", "PLANIFIE", "label", "Planifié"),
                        Map.of("value", "EN_COURS", "label", "En cours"),
                        Map.of("value", "TERMINE", "label", "Terminé"),
                        Map.of("value", "SUSPENDU", "label", "Suspendu")
                ))
                .projetPriorites(List.of(
                        Map.of("value", "BASSE", "label", "Basse"),
                        Map.of("value", "MOYENNE", "label", "Moyenne"),
                        Map.of("value", "HAUTE", "label", "Haute")
                ))
                .competenceLevels(List.of(
                        Map.of("value", 1, "label", "Débutant"),
                        Map.of("value", 2, "label", "Notions"),
                        Map.of("value", 3, "label", "Autonome"),
                        Map.of("value", 4, "label", "Maîtrise"),
                        Map.of("value", 5, "label", "Expert")
                ))
                .competenceTypes(Arrays.stream(TypeCompetence.values())
                        .map(t -> Map.of("value", t.name(), "label", t.name()))
                        .collect(Collectors.toList()))
                .inscriptionStatuts(Arrays.stream(InscriptionStatut.values())
                        .map(s -> Map.of("value", s.name(), "label", getInscriptionStatutLabel(s)))
                        .collect(Collectors.toList()))
                .build());
    }

    private String getRoleLabel(RoleUtilisateur role) {
        return switch (role) {
            case EMPLOYE -> "Employé";
            case MANAGER -> "Manager";
            case RH -> "Ressources Humaines";
            case CHEF_PROJET -> "Chef de Projet";
        };
    }

    private String getFormationTypeLabel(TypeFormation type) {
        return switch (type) {
            case PDF -> "Document PDF";
            case ONLINE -> "En ligne";
            case LIEN -> "Lien externe";
            case PRESENTIEL -> "Présentiel";
        };
    }

    private String getInscriptionStatutLabel(InscriptionStatut statut) {
        return switch (statut) {
            case INSCRIT -> "Inscrit";
            case EN_COURS -> "En cours";
            case TERMINE -> "Terminé";
        };
    }
}
