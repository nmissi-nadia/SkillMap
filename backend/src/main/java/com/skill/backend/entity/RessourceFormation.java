package com.skill.backend.entity;

import com.skill.backend.enums.TypeRessource;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "ressource_formation")
@Getter
@Setter
@NoArgsConstructor
public class RessourceFormation {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formation_id", nullable = false)
    private Formation formation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeRessource typeRessource;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false)
    private String url;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
