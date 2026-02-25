package com.skill.backend.mapper;

import com.skill.backend.dto.FormationDTO;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Formation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface FormationMapper {

    FormationMapper INSTANCE = Mappers.getMapper(FormationMapper.class);

    @Mapping(source = "employes", target = "employeIds", qualifiedByName = "employesToIds")
    @Mapping(source = "employes", target = "nombreInscrits", qualifiedByName = "employesToCount")
    FormationDTO toDto(Formation formation);

    @Mapping(target = "employes", ignore = true)
    Formation toEntity(FormationDTO formationDTO);

    @Named("employesToIds")
    static Set<String> employesToIds(Set<Employe> employes) {
        if (employes == null) return null;
        return employes.stream().map(Employe::getId).collect(Collectors.toSet());
    }

    @Named("employesToCount")
    static Integer employesToCount(Set<Employe> employes) {
        if (employes == null) return 0;
        return employes.size();
    }
}
