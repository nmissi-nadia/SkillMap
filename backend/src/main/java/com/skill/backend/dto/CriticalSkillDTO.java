package com.skill.backend.dto;

import com.skill.backend.enums.TypeCompetence;
import lombok.Data;

@Data
public class CriticalSkillDTO {
    private String competenceId;
    private String competenceNom;
    private TypeCompetence categorie;
    private int nombreEmployes;
    private double niveauMoyen;
    private String criticite; // CRITIQUE, HAUTE, MOYENNE, BASSE
}
