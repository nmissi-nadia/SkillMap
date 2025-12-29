package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogDTO {
    private String id;
    private String action;
    private String entite;
    private String ancienEtat;
    private String nouvelEtat;
    private LocalDateTime dateAction;
    private String utilisateurId;
}
