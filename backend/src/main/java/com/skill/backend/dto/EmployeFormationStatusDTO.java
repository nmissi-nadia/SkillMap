package com.skill.backend.dto;

import lombok.Data;

@Data
public class EmployeFormationStatusDTO {
    private String employeId;
    private String employeNom;
    private String employePrenom;
    private String statut; // ASSIGNEE, EN_COURS, TERMINEE, ABANDONNEE
    private Integer progression; // 0-100%
    private String certification;
    private Boolean valideeParRH;
}
