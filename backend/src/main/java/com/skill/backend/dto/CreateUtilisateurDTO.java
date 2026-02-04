package com.skill.backend.dto;

import com.skill.backend.enums.RoleUtilisateur;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUtilisateurDTO {
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;
    
    @NotNull(message = "Le rôle est obligatoire")
    private RoleUtilisateur role;
    
    private String password; // Optionnel si OAuth
    
    // Champs spécifiques selon le rôle
    private String departement; // Pour EMPLOYE et MANAGER
    private String poste; // Pour EMPLOYE
    private String service; // Pour RH
    private String domaine; // Pour CHEF_PROJET
}
