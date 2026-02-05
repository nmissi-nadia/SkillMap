package com.skill.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class FormationBudgetDTO {
    private String formationId;
    private String titre;
    private Double coutTotal;
    private Integer nombreEmployesAssignes;
    private Integer nombreEmployesTermines;
    private Integer nombreEmployesEnCours;
    private Double coutParEmploye;
    private Double tauxCompletion; // Pourcentage
    private Double roi; // Return on Investment
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private List<EmployeFormationStatusDTO> employesStatuts;
}
