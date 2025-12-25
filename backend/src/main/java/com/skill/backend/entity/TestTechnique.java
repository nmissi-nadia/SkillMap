package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
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
    private String technologie;
    private double score;
    private String resultat; // Réussi / Échoué
    private LocalDateTime datePassage;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "notification_id")
    private Notification notification;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (datePassage == null) datePassage = LocalDateTime.now();
    }
}
