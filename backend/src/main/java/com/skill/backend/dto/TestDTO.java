package com.skill.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class TestDTO {
    private String id;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 150, message = "Le titre doit contenir entre 3 et 150 caractères")
    private String titre;

    @Size(max = 1000, message = "La description ne doit pas dépasser 1000 caractères")
    private String description;

    @NotBlank(message = "La compétence est obligatoire")
    private String competenceId;

    private String dureeMinutes;

    @NotBlank(message = "Le niveau est obligatoire")
    private String niveau; // DEBUTANT, INTERMEDIAIRE, AVANCE, EXPERT

    private LocalDateTime dateCreation;

    @Valid
    @NotNull(message = "La liste de questions est obligatoire")
    @Size(min = 1, message = "Un test doit contenir au moins une question")
    private List<QuestionDTO> questions = new ArrayList<>();
}
