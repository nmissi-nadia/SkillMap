package com.skill.backend.mapper;

import com.skill.backend.dto.ManagerDTO;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Evaluation;
import com.skill.backend.entity.Manager;
import com.skill.backend.entity.Projet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ManagerMapper {

    ManagerMapper INSTANCE = Mappers.getMapper(ManagerMapper.class);

    @Mapping(source = "employes", target = "employeIds", qualifiedByName = "employesToIds")
    @Mapping(source = "evaluations", target = "evaluationIds", qualifiedByName = "evaluationsToIds")
    @Mapping(source = "projets", target = "projetIds", qualifiedByName = "projetsToIds")
    ManagerDTO toDto(Manager manager);

    @Mapping(target = "employes", ignore = true)
    @Mapping(target = "evaluations", ignore = true)
    @Mapping(target = "projets", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    Manager toEntity(ManagerDTO managerDTO);

    @Named("employesToIds")
    static Set<String> employesToIds(Set<Employe> employes) {
        if (employes == null) {
            return null;
        }
        return employes.stream().map(Employe::getId).collect(Collectors.toSet());
    }

    @Named("evaluationsToIds")
    static Set<String> evaluationsToIds(Set<Evaluation> evaluations) {
        if (evaluations == null) {
            return null;
        }
        return evaluations.stream().map(Evaluation::getId).collect(Collectors.toSet());
    }

    @Named("projetsToIds")
    static Set<String> projetsToIds(Set<Projet> projets) {
        if (projets == null) {
            return null;
        }
        return projets.stream().map(Projet::getId).collect(Collectors.toSet());
    }
}
