package com.skill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRequestDTO {
    private Integer niveauManager;
    private String commentaireManager;
    private Boolean valide;
}
