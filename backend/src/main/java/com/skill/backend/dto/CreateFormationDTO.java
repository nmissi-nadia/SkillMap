package com.skill.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateFormationDTO {
    @NotBlank(message = "Le titre est obligatoire")
    private String titre;
    
    @NotBlank(message = "L'organisme est obligatoire")
    private String organisme;
    
    @NotNull(message = "Le type est obligatoire")
    private String type; // Interne / Externe
    
    private String statut; // Recommandée / Suivie / Validée (par défaut: Recommandée)
    
    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;
    
    private LocalDate dateFin;
    
    private Double cout;
    
    private String certification; // Nom de la certification
}
