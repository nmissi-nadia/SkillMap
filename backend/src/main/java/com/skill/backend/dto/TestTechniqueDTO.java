package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TestTechniqueDTO {
    private String id;
    private String titre;
    private String technologie;
    private double score;
    private String resultat;
    private LocalDateTime datePassage;
    private String employeId;
    private String notificationId;
}
