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
    private String managerId;
    private String auditLogId;
}
