package com.skill.backend.mapper;

import com.skill.backend.dto.CompetenceEmployeDTO;
import com.skill.backend.entity.CompetenceEmploye;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CompetenceEmployeMapper {

    CompetenceEmployeMapper INSTANCE = Mappers.getMapper(CompetenceEmployeMapper.class);

    @Mapping(source = "employe.id", target = "employeId")
    @Mapping(source = "competence.id", target = "competenceId")
    @Mapping(source = "competence.nom", target = "competenceNom")
    @Mapping(source = "competence", target = "competence")
    CompetenceEmployeDTO toDto(CompetenceEmploye competenceEmploye);

    @Mapping(source = "employeId", target = "employe.id")
    @Mapping(source = "competenceId", target = "competence.id")
    CompetenceEmploye toEntity(CompetenceEmployeDTO competenceEmployeDTO);
}
