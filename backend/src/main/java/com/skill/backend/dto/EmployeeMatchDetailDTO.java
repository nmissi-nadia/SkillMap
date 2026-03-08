package com.skill.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class EmployeeMatchDetailDTO {
    @JsonProperty("employeId")
    private String employeId;
    
    @JsonProperty("employeNom")
    private String employeNom;
    
    @JsonProperty("employePrenom")
    private String employePrenom;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("poste")
    private String poste;
    
    @JsonProperty("departement")
    private String departement;
    
    @JsonProperty("matchScore")
    private Double matchScore;
    
    @JsonProperty("disponibilite")
    private String disponibilite;
    
    @JsonProperty("tauxAllocationActuel")
    private Integer tauxAllocationActuel;
    
    @JsonProperty("competencesMatched")
    private List<CompetenceMatchDTO> competencesMatched;
    
    @JsonProperty("competencesMissing")
    private List<CompetenceMatchDTO> competencesMissing;
    
    @JsonProperty("anneesExperience")
    private Integer anneesExperience;
    
    @JsonProperty("projetsAnterieurs")
    private List<String> projetsAnterieurs;
}
