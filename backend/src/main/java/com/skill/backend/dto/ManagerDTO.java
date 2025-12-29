package com.skill.backend.dto;

import com.skill.backend.enums.RoleUtilisateur;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ManagerDTO {
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dernierLogin;
    private RoleUtilisateur role;
    private String departementResponsable;
    private Set<String> employeIds;
    private Set<String> evaluationIds;
    private Set<String> projetIds;
}
