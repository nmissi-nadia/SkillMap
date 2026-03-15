package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "question")
@Getter
@Setter
@NoArgsConstructor
public class Question {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    private String typeQuestion; // QCM, VRAI_FAUX, TEXTE_LIBRE

    @Column(columnDefinition = "TEXT")
    private String bonneReponse;

    private Integer points;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_technique_id", nullable = false)
    private TestTechnique testTechnique;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
