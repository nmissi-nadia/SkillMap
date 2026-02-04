package com.skill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamStatsDTO {
    private Integer nombreEmployes;
    private Double niveauMoyenEquipe;
    private List<String> competencesFortes;
    private List<String> competencesFaibles;
    private Integer evaluationsEnAttente;
    private Integer testsEnCours;
    private Integer projetsActifs;
}
