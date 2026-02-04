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
}
