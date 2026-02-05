package com.skill.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CertificationValidationDTO {
    @NotNull(message = "L'ID de l'employé est obligatoire")
    private String employeId;
    
    @NotNull(message = "L'ID de la formation est obligatoire")
    private String formationId;
    
    @NotBlank(message = "Le nom de la certification est obligatoire")
    private String certification;
    
    private String urlCertificat;
    
    private Boolean valide; // true = validée, false = rejetée
    
    private String commentaire;
}
