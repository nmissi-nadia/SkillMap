package com.skill.backend.mapper;

import com.skill.backend.dto.TestTechniqueDTO;
import com.skill.backend.entity.TestTechnique;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TestTechniqueMapper {

    @Mapping(target = "technologie", source = "technologie")
    @Mapping(target = "employeId", ignore = true)
    @Mapping(target = "employeNom", ignore = true)
    @Mapping(target = "notificationId", ignore = true)
    @Mapping(target = "score", ignore = true)
    @Mapping(target = "resultat", ignore = true)
    @Mapping(target = "datePassage", ignore = true)
    @Mapping(target = "statut", ignore = true)
    @Mapping(target = "dateAssignation", ignore = true)
    @Mapping(target = "dateLimite", ignore = true)
    @Mapping(target = "assignePar", ignore = true)
    TestTechniqueDTO toDto(TestTechnique testTechnique);

    @Mapping(target = "questions", ignore = true)
    TestTechnique toEntity(TestTechniqueDTO testTechniqueDTO);
}
