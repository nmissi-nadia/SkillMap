package com.skill.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class EmployeeMatchDTO {
    @JsonProperty("employeId")
    private String employeId;
    
    @JsonProperty("employeNom")
    private String employeNom;
    
    @JsonProperty("employePrenom")
    private String employePrenom;
    
    @JsonProperty("poste")
    private String poste;
    
    @JsonProperty("matchScore")
    private Double matchScore;           // Score global 0-100
    
    @JsonProperty("competencesMatched")
    private Integer competencesMatched;  // Nombre de compétences matchées
    
    @JsonProperty("competencesRequired")
    private Integer competencesRequired; // Nombre de compétences requises
    
    @JsonProperty("disponibilite")
    private String disponibilite;        // DISPONIBLE, PARTIELLEMENT, INDISPONIBLE
    
    @JsonProperty("tauxAllocationActuel")
    private Integer tauxAllocationActuel; // % déjà alloué
}
