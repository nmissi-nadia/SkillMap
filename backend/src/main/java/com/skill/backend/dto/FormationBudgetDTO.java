package com.skill.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class FormationBudgetDTO {
    private String formationId;
    private String titre;
    private Double coutTotal;
    private Double coutUnitaire;         // cout par inscrit
    private Integer nombreInscrits;      // = nombreEmployesAssignes
    private Integer nombreEmployesAssignes;
    private Integer nombreEmployesTermines;
    private Integer nombreEmployesEnCours;
    private Double coutParEmploye;
    private Double tauxCompletion;
    private Double roi;
    private Double budgetRestant;        // maxParticipants * cout - coutTotal
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private List<EmployeFormationStatusDTO> employesStatuts;
}
