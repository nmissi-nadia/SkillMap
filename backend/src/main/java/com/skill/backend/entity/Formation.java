package com.skill.backend.entity;

import com.skill.backend.enums.TypeFormation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
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

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TypeFormation typeFormation; // PDF, ONLINE, PRESENTIEL

    private String technologie;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    private String lieu;

    // Nouveau set pour gérer les ressources
    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RessourceFormation> ressources = new ArrayList<>();

    // Nouveau set pour gérer les compétences cibles
    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormationCompetence> formationCompetences = new ArrayList<>();

    // Nouveau set pour gérer les inscriptions
    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InscriptionFormation> inscriptions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
