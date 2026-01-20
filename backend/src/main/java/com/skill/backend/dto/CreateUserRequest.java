package com.skill.backend.dto;

import com.skill.backend.enums.Role;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateUserRequest {
    // Champs communs
    private String nom;
    private String prenom;
    private String email;
    private String password; // Mot de passe temporaire
    private Role role;
    
    // Champs spécifiques EMPLOYE
    private String matricule;
    private String poste;
    private String departement;
    private LocalDate dateEmbauche;
    private String niveauExperience; // Junior, Confirmé, Senior, Expert
    private Boolean disponibilite;
    private String managerId; // ID du manager
    
    // Champs spécifiques MANAGER
    private String departementResponsable;
    
    // Champs spécifiques RH
    private String service;
    
    // Champs spécifiques CHEF_PROJET
    private String domaine;
}
