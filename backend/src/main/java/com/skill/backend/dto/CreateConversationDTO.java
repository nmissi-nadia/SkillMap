package com.skill.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateConversationDTO {
    private String titre;
    private String type; // PRIVE ou GROUPE
    private List<String> participantIds;
}
