package com.skill.backend.dto;

import com.skill.backend.enums.RoleUtilisateur;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class EmployeDTO {
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dernierLogin;
    private RoleUtilisateur role;
    private String matricule;
    private String poste;
    private String departement;
    private LocalDate dateEmbauche;
    private String niveauExperience;
    private boolean disponibilite;
    private String managerId;
    private Set<String> competenceEmployeIds;
    private Set<String> evaluationIds;
    private Set<String> testTechniqueIds;
    private Set<String> messageEnvoyeIds;
    private Set<String> projetIds;
    private Set<String> formationIds;
}
