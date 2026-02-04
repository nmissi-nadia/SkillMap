package com.skill.backend.dto;

import com.skill.backend.enums.TypeCompetence;
import lombok.Data;

@Data
public class RareSkillDTO {
    private String competenceId;
    private String competenceNom;
    private TypeCompetence categorie;
    private int nombreEmployes;
    private String rarete; // UNIQUE, TRÈS_RARE, RARE, COMMUN
}
