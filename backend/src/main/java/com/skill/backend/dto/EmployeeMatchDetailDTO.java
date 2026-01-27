package com.skill.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmployeeMatchDetailDTO {
    private String employeId;
    private String employeNom;
    private String employePrenom;
    private String email;
    private String poste;
    private String departement;
    private Double matchScore;
    private String disponibilite;
    private Integer tauxAllocationActuel;
    
    // Détails des compétences
    private List<CompetenceMatchDTO> competencesMatched;
    private List<CompetenceMatchDTO> competencesMissing;
    
    // Expérience
    private Integer anneesExperience;
    private List<String> projetsAnterieurs;
}
