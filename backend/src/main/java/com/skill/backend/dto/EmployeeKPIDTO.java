package com.skill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeKPIDTO {
    private Double niveauGlobalCompetences;
    private Integer competencesValidees;
    private Integer formationsEnCours;
    private Integer projetsActifs;
}
