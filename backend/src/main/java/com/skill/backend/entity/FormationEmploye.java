package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "formation_employe")
@Getter
@Setter
@NoArgsConstructor
public class FormationEmploye {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;

    private String statut;             // ASSIGNEE, EN_COURS, TERMINEE, ABANDONNEE
    private LocalDateTime dateAssignation;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Integer progression;       // 0-100%
    private String certification;
    private String urlCertificat;
    private String motifAbandon;
    private Boolean valideeParRH;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (dateAssignation == null) dateAssignation = LocalDateTime.now();
        if (progression == null) progression = 0;
        if (valideeParRH == null) valideeParRH = false;
    }
}
