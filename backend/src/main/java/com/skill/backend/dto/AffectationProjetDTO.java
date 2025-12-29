package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AffectationProjetDTO {
    private String id;
    private String roleDansProjet;
    private LocalDate dateAffectation;
    private String employeId;
    private String projetId;
}
