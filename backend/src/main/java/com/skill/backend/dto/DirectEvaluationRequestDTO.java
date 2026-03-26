package com.skill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DirectEvaluationRequestDTO {
    private String employeId;
    private String competenceId;
    private int niveau;
    private String commentaire;
}
