package com.skill.backend.dto;

import com.skill.backend.enums.Provider;
import com.skill.backend.enums.RoleUtilisateur;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UtilisateurDTO {
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private boolean enabled;
    private LocalDateTime dateCreation;
    private RoleUtilisateur role;
    private Provider provider;

    // Champs spécifiques EMPLOYE
    private String matricule;
    private String poste;
    private String departement;
    private String dateEmbauche;
    private String niveauExperience;
    private Boolean disponibilite;
    private String managerId;

    // Champs spécifiques MANAGER
    private String departementResponsable;

    // Champs spécifiques RH
    private String service;

    // Champs spécifiques CHEF_PROJET
    private String domaine;
}
