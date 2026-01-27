package com.skill.backend.dto;

import lombok.Data;

@Data
public class ValidationEvaluationDTO {
    private Integer niveauValide;          // Niveau validé par le manager (1-5)
    private String commentaireManager;     // Commentaire du manager
    private Boolean ajustement;            // true si niveau différent de l'auto-évaluation
}
