package com.skill.backend.dto;

import lombok.Data;

@Data
public class CompetenceMatchDTO {
    private String competenceId;
    private String competenceNom;
    private Integer niveauRequis;
    private Integer niveauEmploye;
    private String statut;  // PARFAIT, SUFFISANT, INSUFFISANT, MANQUANT
    private Double scoreMatch; // 0-100
}
