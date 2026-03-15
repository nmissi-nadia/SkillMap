package com.skill.backend.dto;

import com.skill.backend.enums.InscriptionStatut;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class InscriptionDTO {
    private String id;
    private String employeId;
    private String employeNom;
    private String employePrenom;
    private InscriptionStatut statut;
    private Integer progress;
    private Integer score;
    private LocalDateTime dateInscription;
}
