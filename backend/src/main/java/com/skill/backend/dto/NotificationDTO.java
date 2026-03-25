package com.skill.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO exposé par l'API REST pour les notifications.
 * N'expose pas l'entité directement (clean architecture).
 */
@Data
@Builder
public class NotificationDTO {
    private String id;
    private String titre;
    private String contenu;
    private String type;       // INFO / ALERTE / ACTION / SUCCESS
    private boolean lu;
    private LocalDateTime dateEnvoi;
    private String lien;       // URL de redirection
    private String senderNom;  // Nom de l'expéditeur
    private String senderId;
}
