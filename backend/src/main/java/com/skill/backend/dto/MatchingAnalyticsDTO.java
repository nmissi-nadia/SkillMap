package com.skill.backend.dto;

import lombok.Data;

@Data
public class MatchingAnalyticsDTO {
    private Integer totalEmployes;
    private Integer employesDisponibles;
    private Integer employesQualifies;      // Score >= 70
    private Double scoreMatchMoyen;
    private Integer competencesCritiquesManquantes;
    private String recommandation;          // Message d'analyse
}
