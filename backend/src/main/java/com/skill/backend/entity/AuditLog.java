package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @Column(length = 36)
    private String id;

    private String action;
    private String entite;

    @Lob
    private String ancienEtat; // JSON

    @Lob
    private String nouvelEtat; // JSON

    private LocalDateTime dateAction;
    private String utilisateurId;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (dateAction == null) dateAction = LocalDateTime.now();
    }
}
