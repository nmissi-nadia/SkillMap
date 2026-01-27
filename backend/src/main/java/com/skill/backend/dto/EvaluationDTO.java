package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvaluationDTO {
    private String id;
    private String type;
    private double score;
    private String commentaire;
    private LocalDateTime dateEvaluation;
    private String employeId;
    private String employeNom;
    private String managerId;
    private String managerNom;
    private String competenceId;
    private String competenceNom;
    private String auditLogId;
    
    // Manager validation workflow
    private Integer niveauAutoEvalue;
    private Integer niveauValide;
    private String commentaireEmploye;
    private String commentaireManager;
    private String statut;
    private LocalDateTime dateValidation;
}
