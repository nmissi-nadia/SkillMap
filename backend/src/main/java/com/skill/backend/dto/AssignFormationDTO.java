package com.skill.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AssignFormationDTO {
    @NotNull(message = "L'ID de la formation est obligatoire")
    private String formationId;
    
    @NotEmpty(message = "La liste des employés ne peut pas être vide")
    private List<String> employeIds;
    
    private String commentaire;
}
