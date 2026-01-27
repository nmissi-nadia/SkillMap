package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "recommandation_formation")
@Getter
@Setter
@NoArgsConstructor
public class RecommandationFormation {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;

    @ManyToOne
    @JoinColumn(name = "competence_id")
    private Competence competence;  // Compétence à améliorer

    private Integer niveauActuel;
    private Integer niveauCible;
    private Double priorite;        // Score de priorité (0-100)
    private String statut;          // PROPOSEE, VALIDEE_RH, ACCEPTEE, REFUSEE
    private String justification;   // Raison de la recommandation
    private LocalDateTime dateRecommandation;
    private String recommandePar;   // SYSTEME ou ID du RH

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (dateRecommandation == null) dateRecommandation = LocalDateTime.now();
    }
}
