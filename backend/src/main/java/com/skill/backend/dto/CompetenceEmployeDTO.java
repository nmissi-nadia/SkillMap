package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CompetenceEmployeDTO {
    private String id;
    private int niveauAuto;
    private int niveauManager;
    private LocalDate dateEvaluation;
    private String commentaire;
    private String employeId;
    private String competenceId;
    private String competenceNom;
}
