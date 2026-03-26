package com.skill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerEvaluationRequestDTO {
    private String competenceId;
    private Integer niveau;
    private String commentaire;
}
