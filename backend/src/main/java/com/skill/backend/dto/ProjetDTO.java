package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class ProjetDTO {
    private String id;
    private String nom;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;
    private Set<String> employeIds;
    private String chefProjetId;
    private Set<String> messageIds;
}
