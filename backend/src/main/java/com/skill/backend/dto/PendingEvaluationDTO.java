package com.skill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PendingEvaluationDTO {
    private String id;
    private EmployeSimpleDTO employe;
    private CompetenceSimpleDTO competence;
    private Integer niveauAuto;
    private String commentaireEmploye;
    private LocalDate dateAutoEvaluation;
    private String statut;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeSimpleDTO {
        private String id;
        private String nom;
        private String prenom;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompetenceSimpleDTO {
        private String id;
        private String nom;
    }
}
