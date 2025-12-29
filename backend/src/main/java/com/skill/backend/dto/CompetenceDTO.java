package com.skill.backend.dto;

import com.skill.backend.enums.TypeCompetence;
import lombok.Data;
import java.util.Set;

@Data
public class CompetenceDTO {
    private String id;
    private String nom;
    private TypeCompetence type;
    private String description;
    private Set<String> competenceEmployeIds;
}
