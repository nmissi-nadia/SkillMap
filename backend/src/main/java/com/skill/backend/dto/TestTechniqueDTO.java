package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TestTechniqueDTO {
    private String id;
    private String titre;
    private String technologie;
    private Double score;
    private String resultat;
    private LocalDateTime datePassage;
    private String employeId;
    private String employeNom;
    private String notificationId;
    
    // Workflow fields
    private String competenceId;
    private String competenceNom;
    private String statut;
    private String dateAssignation;
    private String dateLimite;
    private String assignePar;
    private Integer niveauCompetence;
}
