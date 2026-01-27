package com.skill.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateEmployeRequest {
    // Informations personnelles
    private String nom;
    private String prenom;
    private String email;
    
    // Informations professionnelles
    private String matricule;
    private String poste;
    private String departement;
    private LocalDate dateEmbauche;
    private String niveauExperience; // Junior, Confirmé, Senior, Expert
    private Boolean disponibilite;
    
    // Manager
    private String managerId;
}
