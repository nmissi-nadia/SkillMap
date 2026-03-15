package com.skill.backend.mapper;

import com.skill.backend.dto.FormationDTO;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Formation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface FormationMapper {

    FormationMapper INSTANCE = Mappers.getMapper(FormationMapper.class);

    @Mapping(source = "inscriptions", target = "employeIds", qualifiedByName = "inscriptionsToIds")
    @Mapping(source = "inscriptions", target = "nombreInscrits", qualifiedByName = "inscriptionsToCount")
    FormationDTO toDto(Formation formation);

    @Mapping(target = "inscriptions", ignore = true)
    Formation toEntity(FormationDTO formationDTO);

    @Named("inscriptionsToIds")
    static Set<String> inscriptionsToIds(List<com.skill.backend.entity.InscriptionFormation> inscriptions) {
        if (inscriptions == null) return null;
        return inscriptions.stream().map(i -> i.getEmploye().getId()).collect(Collectors.toSet());
    }

    @Named("inscriptionsToCount")
    static Integer inscriptionsToCount(List<com.skill.backend.entity.InscriptionFormation> inscriptions) {
        if (inscriptions == null) return 0;
        return inscriptions.size();
    }
}
