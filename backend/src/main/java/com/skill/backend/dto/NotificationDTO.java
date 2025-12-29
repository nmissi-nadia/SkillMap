package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private String id;
    private String titre;
    private String contenu;
    private String type;
    private boolean lu;
    private LocalDateTime dateEnvoi;
    private String utilisateurId;
}
