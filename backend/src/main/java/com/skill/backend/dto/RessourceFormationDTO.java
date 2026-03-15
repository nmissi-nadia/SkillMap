package com.skill.backend.dto;

import com.skill.backend.enums.TypeRessource;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RessourceFormationDTO {
    private String id;
    private String titre;
    private String url;
    private TypeRessource typeRessource;
}
