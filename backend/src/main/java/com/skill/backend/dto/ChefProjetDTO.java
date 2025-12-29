package com.skill.backend.dto;

import com.skill.backend.enums.RoleUtilisateur;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ChefProjetDTO {
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dernierLogin;
    private RoleUtilisateur role;
    private String domaine;
    private Set<String> projetIds;
    private Set<String> affectationIds;
    private Set<String> messageProjetIds;
}
