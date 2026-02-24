package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjetDTO {
    private String id;
    private String nom;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;
    private String chefProjetId;
    private String chefProjetNom;
    // Champs workflow
    private String client;
    private Double budget;
    private String priorite;
    private Integer chargeEstimee;
    private Integer progression;
    private Integer nombreMembres;
}
