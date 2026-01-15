package com.skill.backend.dto;

import lombok.Data;

@Data
public class ValidationEvaluationDTO {
    private int niveauManager; // 1-5
    private String commentaireManager;
}
