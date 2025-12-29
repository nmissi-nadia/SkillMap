package com.skill.backend.dto;

import com.skill.backend.enums.RoleUtilisateur;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UtilisateurDTO {
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dernierLogin;
    private RoleUtilisateur role;
}
