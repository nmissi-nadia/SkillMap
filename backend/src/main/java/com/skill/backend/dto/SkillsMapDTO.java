package com.skill.backend.dto;

import com.skill.backend.enums.TypeCompetence;
import lombok.Data;

import java.util.Map;

@Data
public class SkillsMapDTO {
    private long totalCompetences;
    private long totalEmployes;
    private double niveauMoyenGlobal;
    private Map<TypeCompetence, Long> repartitionParCategorie;
}
