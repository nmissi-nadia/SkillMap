package com.skill.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.skill.backend.enums.RoleUtilisateur;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "utilisateur")
@Getter
@Setter
@NoArgsConstructor
public abstract class Utilisateur {

    @Id
    @Column(length = 36)
    private String id;

    private String nom;
    private String prenom;

    @Column(unique = true)
    private String email;

    private String motDePasse;
    private String telephone;
    private boolean actif = true;

    private LocalDateTime dateCreation;
    private LocalDateTime dernierLogin;

    @Enumerated(EnumType.STRING)
    private RoleUtilisateur role;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (dateCreation == null) dateCreation = LocalDateTime.now();
    }
}
