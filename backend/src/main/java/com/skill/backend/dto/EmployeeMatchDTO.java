package com.skill.backend.dto;

import lombok.Data;

@Data
public class EmployeeMatchDTO {
    private String employeId;
    private String employeNom;
    private String employePrenom;
    private String poste;
    private Double matchScore;           // Score global 0-100
    private Integer competencesMatched;  // Nombre de compétences matchées
    private Integer competencesRequired; // Nombre de compétences requises
    private String disponibilite;        // DISPONIBLE, PARTIELLEMENT, INDISPONIBLE
    private Integer tauxAllocationActuel; // % déjà alloué
}
