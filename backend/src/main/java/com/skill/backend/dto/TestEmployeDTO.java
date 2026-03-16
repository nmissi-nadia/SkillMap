package com.skill.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestEmployeDTO {
    private String id;
    private String testId;
    private String testTitre;
    private String employeId;
    private String employeNom;
    private String employePrenom;
    private String managerId;
    private String managerNom;

    /** ASSIGNED | IN_PROGRESS | COMPLETED */
    private String statut;

    private Double score;
    private String technologie;
    private LocalDateTime dateAssignation;
    private LocalDateTime dateSoumission;
    private LocalDateTime dateLimite;
}
