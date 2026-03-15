package com.skill.backend.entity;

import com.skill.backend.enums.InscriptionStatut;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inscription_formation")
@Getter
@Setter
@NoArgsConstructor
public class InscriptionFormation {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formation_id", nullable = false)
    private Formation formation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InscriptionStatut statut;

    private Integer progress;
    private Integer score;
    private LocalDateTime dateInscription;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (dateInscription == null) {
            dateInscription = LocalDateTime.now();
        }
        if (statut == null) {
            statut = InscriptionStatut.INSCRIT;
        }
        if (progress == null) {
            progress = 0;
        }
    }
}
