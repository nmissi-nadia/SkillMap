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
}
