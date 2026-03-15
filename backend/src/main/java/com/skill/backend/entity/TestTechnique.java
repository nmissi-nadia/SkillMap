package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "test_technique")
@Getter
@Setter
@NoArgsConstructor
public class TestTechnique {

    @Id
    @Column(length = 36)
    private String id;

    private String titre;
    private String description;

    /** Compétence testée (ID référence) */
    private String competenceId;

    /** Anciennement 'technologie', gardé pour compatibilité */
    private String technologie;

    private Integer dureeMinutes;

    /** Niveau ciblé : DEBUTANT, INTERMEDIAIRE, AVANCE, EXPERT */
    private String niveau;

    private LocalDateTime dateCreation;

    @OneToMany(mappedBy = "testTechnique", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (dateCreation == null) dateCreation = LocalDateTime.now();
    }
}
