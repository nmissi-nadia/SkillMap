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
@Table(name = "formation")
@Getter
@Setter
@NoArgsConstructor
public class Formation {

    @Id
    @Column(length = 36)
    private String id;

    private String titre;
    private String organisme;
    private String type; // Interne / Externe
    private String statut; // Recommandée / Suivie / Validée
    private LocalDate dateDebut;
    private LocalDate dateFin;

    @ManyToMany(mappedBy = "formations")
    private Set<Employe> employes = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
