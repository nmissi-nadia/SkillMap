package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private String id;
    private String contenu;
    private LocalDateTime dateEnvoi;
    private boolean lu;
    private String expediteurId;
    private String expediteurNom;
    private String expediteurPrenom;
    private String expediteurRole;
    private String destinataireId;
    private String projetId;
    private String conversationId;
}
