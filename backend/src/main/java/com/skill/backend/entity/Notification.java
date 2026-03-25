package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @Column(length = 36)
    private String id;

    private String titre;

    @Lob
    private String contenu;

    private String type; // INFO / ALERTE / ACTION / SUCCESS

    private boolean lu = false;

    private LocalDateTime dateEnvoi;

    /** Lien de redirection (ex: /projets/project-id) */
    private String lien;

    /** ID de l'expéditeur de la notification */
    private String senderId;

    /** Nom affiché de l'expéditeur */
    private String senderNom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (dateEnvoi == null) dateEnvoi = LocalDateTime.now();
    }
}
