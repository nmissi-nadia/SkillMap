package com.skill.backend.dto;

import com.skill.backend.enums.TypeFormation;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CreateFormationRequestDTO {
    private String titre;
    private String description;
    private TypeFormation typeFormation;
    private String technologie;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String lieu;
    private String competenceId;
    private Integer niveauCible;
    private List<CreateRessourceDTO> ressources;
}
