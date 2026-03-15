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
@Table(name = "test_employe")
@Getter
@Setter
@NoArgsConstructor
public class TestEmploye {

    @Id
    @Column(length = 36)
    private String id;

    /** Statut : ASSIGNED | IN_PROGRESS | COMPLETED */
    private String statut;

    private Double score;

    private LocalDateTime dateAssignation;
    private LocalDateTime dateSoumission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_technique_id", nullable = false)
    private TestTechnique testTechnique;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @OneToMany(mappedBy = "testEmploye", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReponseEmploye> reponses = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (dateAssignation == null) dateAssignation = LocalDateTime.now();
    }
}
