package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "affectation_projet")
@Getter
@Setter
@NoArgsConstructor
public class AffectationProjet {

    @Id
    @Column(length = 36)
    private String id;

    private String roleDansProjet;
    private LocalDate dateAffectation;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
