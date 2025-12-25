package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.skill.backend.enums.TypeCompetence;

@Entity
@Table(name = "competence")
@Getter
@Setter
@NoArgsConstructor
public class Competence {

    @Id
    @Column(length = 36)
    private String id;

    private String nom;

    @Enumerated(EnumType.STRING)
    private TypeCompetence type;

    private String description;

    @OneToMany(mappedBy = "competence", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CompetenceEmploye> competenceEmployes = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
