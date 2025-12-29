package com.skill.backend.mapper;

import com.skill.backend.dto.CompetenceDTO;
import com.skill.backend.entity.Competence;
import com.skill.backend.entity.CompetenceEmploye;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CompetenceMapper {

    CompetenceMapper INSTANCE = Mappers.getMapper(CompetenceMapper.class);

    @Mapping(source = "competenceEmployes", target = "competenceEmployeIds", qualifiedByName = "competenceEmployesToIds")
    CompetenceDTO toDto(Competence competence);

    Competence toEntity(CompetenceDTO competenceDTO);

    @Named("competenceEmployesToIds")
    static Set<String> competenceEmployesToIds(Set<CompetenceEmploye> competenceEmployes) {
        if (competenceEmployes == null) {
            return null;
        }
        return competenceEmployes.stream().map(CompetenceEmploye::getId).collect(Collectors.toSet());
    }
}
