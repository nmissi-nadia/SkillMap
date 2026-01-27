package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "projet")
@Getter
@Setter
@NoArgsConstructor
public class Projet {

    @Id
    @Column(length = 36)
    private String id;

    private String nom;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut; // Planifié / En cours / Terminé
    
    // Workflow gestion projet
    private String client;                 // Client (interne/externe)
    private Double budget;
    private String priorite;               // HAUTE, MOYENNE, BASSE
    private Integer chargeEstimee;         // Jours/homme
    private Integer progression;           // 0-100%

    @ManyToMany(mappedBy = "projets")
    private Set<Employe> employes = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "chef_projet_id")
    private ChefProjet chefProjet;

    @OneToMany(mappedBy = "projet")
    private Set<Message> messages = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
