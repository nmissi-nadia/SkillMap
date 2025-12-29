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
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Set<String> employeIds;
}
