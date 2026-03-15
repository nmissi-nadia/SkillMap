package com.skill.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionDTO {
    private String id;

    @NotBlank(message = "Le contenu de la question est obligatoire")
    private String contenu;

    @NotBlank(message = "Le type de question est obligatoire")
    private String typeQuestion; // QCM, VRAI_FAUX, TEXTE_LIBRE

    private String bonneReponse;

    @NotNull(message = "Le nombre de points est obligatoire")
    @Min(value = 1, message = "Les points doivent être au moins 1")
    private Integer points;

    private String testId;
}
