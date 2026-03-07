package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "competence_requise_projet")
@Getter
@Setter
@NoArgsConstructor
public class CompetenceRequiseProjet {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @ManyToOne
    @JoinColumn(name = "competence_id")
    private Competence competence;

    private Integer niveauRequis;      // 1-5
    private Integer nombrePersonnes;   // Nombre de personnes nécessaires
    private String priorite;           // CRITIQUE, IMPORTANTE, SOUHAITABLE
    private Double poids;              // Importance dans le projet

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
