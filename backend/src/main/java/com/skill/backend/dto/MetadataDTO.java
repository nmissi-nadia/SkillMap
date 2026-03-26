package com.skill.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class MetadataDTO {
    private List<Map<String, String>> roles;
    private List<Map<String, String>> formationTypes;
    private List<Map<String, String>> formationStatuts;
    private List<Map<String, String>> projetStatuts;
    private List<Map<String, String>> projetPriorites;
    private List<Map<String, Object>> competenceLevels;
    private List<Map<String, String>> competenceTypes;
    private List<Map<String, String>> inscriptionStatuts;
}
