package com.skill.backend.dto;

import lombok.Data;

@Data
public class UpdateUtilisateurDTO {
    private String nom;
    private String prenom;
    private String email;
    private String departement;
    private String poste;
    private String service;
    private String domaine;

    // Nouveaux champs pour mise à jour complète
    private String matricule;
    private String dateEmbauche;
    private String niveauExperience;
    private Boolean disponibilite;
    private String managerId;
    private String departementResponsable;
}
