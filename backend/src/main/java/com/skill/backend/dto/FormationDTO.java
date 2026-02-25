package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class FormationDTO {
    private String id;
    private String titre;
    private String organisme;
    private String type;
    private String statut;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double cout;
    private Integer dureeHeures;
    private Integer maxParticipants;
    private Integer niveauRequis;
    private Integer nombreInscrits;      // calculé (taille de employes)
    private String certification;
    private Set<String> employeIds;
}
