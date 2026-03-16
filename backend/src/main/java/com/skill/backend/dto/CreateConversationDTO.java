package com.skill.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateConversationDTO {
    private String titre;
    private List<String> participantIds;
}
