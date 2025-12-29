package com.skill.backend.mapper;

import com.skill.backend.dto.AffectationProjetDTO;
import com.skill.backend.entity.AffectationProjet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AffectationProjetMapper {

    AffectationProjetMapper INSTANCE = Mappers.getMapper(AffectationProjetMapper.class);

    @Mapping(source = "employe.id", target = "employeId")
    @Mapping(source = "projet.id", target = "projetId")
    AffectationProjetDTO toDto(AffectationProjet affectationProjet);

    @Mapping(source = "employeId", target = "employe.id")
    @Mapping(source = "projetId", target = "projet.id")
    AffectationProjet toEntity(AffectationProjetDTO affectationProjetDTO);
}
