package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConversationDTO {
    private String id;
    private String titre;
    private LocalDateTime dateCreation;
    private List<UtilisateurDTO> participants;
    private MessageDTO dernierMessage;
}
