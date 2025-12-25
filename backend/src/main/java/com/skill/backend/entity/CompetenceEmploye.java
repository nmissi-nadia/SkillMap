package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "competence_employe")
@Getter
@Setter
@NoArgsConstructor
public class CompetenceEmploye {

    @Id
    @Column(length = 36)
    private String id;

    private int niveauAuto; // 1-5
    private int niveauManager; // 1-5
    private LocalDate dateEvaluation;
    private String commentaire;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "competence_id")
    private Competence competence;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
