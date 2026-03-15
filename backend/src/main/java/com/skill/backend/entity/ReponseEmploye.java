package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "reponse_employe")
@Getter
@Setter
@NoArgsConstructor
public class ReponseEmploye {

    @Id
    @Column(length = 36)
    private String id;

    @Column(columnDefinition = "TEXT")
    private String reponse;

    private Boolean estCorrect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_employe_id", nullable = false)
    private TestEmploye testEmploye;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
