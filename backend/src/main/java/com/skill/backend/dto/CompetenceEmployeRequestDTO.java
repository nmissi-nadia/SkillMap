package com.skill.backend.dto;

import lombok.Data;

@Data
public class CompetenceEmployeRequestDTO {
    private String competenceId;
    private int niveauAuto; // 1-5
    private String commentaire;
}
