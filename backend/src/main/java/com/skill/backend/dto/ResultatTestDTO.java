package com.skill.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResultatTestDTO {
    private String testEmployeId;
    private String employeId;
    private String testId;
    private String testTitre;
    private Double score;
    private String statut;
    private Integer niveauCompetenceAttribue;
    private String competenceId;
    private LocalDateTime dateSoumission;
    private int totalPoints;
    private int pointsObtenus;
}
