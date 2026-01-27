package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "evaluation")
@Getter
@Setter
@NoArgsConstructor
public class Evaluation {

    @Id
    @Column(length = 36)
    private String id;

    private String type; // annuelle, projet, test
    private double score;
    private String commentaire;
    private LocalDateTime dateEvaluation;
    
    // Workflow validation manager
    private Integer niveauAutoEvalue;      // Niveau auto-évalué (1-5)
    private Integer niveauValide;          // Niveau validé par manager (1-5)
    private String commentaireEmploye;     // Commentaire employé
    private String commentaireManager;     // Commentaire manager
    private String statut;                 // EN_ATTENTE, VALIDEE, AJUSTEE
    private LocalDateTime dateValidation;  // Date validation manager

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Manager manager;
    
    @ManyToOne
    @JoinColumn(name = "competence_id")
    private Competence competence;         // Compétence évaluée

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "auditlog_id")
    private AuditLog auditLog;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (dateEvaluation == null) dateEvaluation = LocalDateTime.now();
    }
}
