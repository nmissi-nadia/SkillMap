package com.skill.backend.mapper;

import com.skill.backend.dto.EmployeDTO;
import com.skill.backend.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface EmployeMapper {

    EmployeMapper INSTANCE = Mappers.getMapper(EmployeMapper.class);

    @Mapping(source = "manager.id", target = "managerId")
    @Mapping(source = "competenceEmployes", target = "competenceEmployeIds", qualifiedByName = "competenceEmployesToIds")
    @Mapping(source = "evaluations", target = "evaluationIds", qualifiedByName = "evaluationsToIds")
    @Mapping(source = "testsTechniques", target = "testTechniqueIds", qualifiedByName = "testTechniquesToIds")
    @Mapping(source = "messagesEnvoyes", target = "messageEnvoyeIds", qualifiedByName = "messagesToIds")
    @Mapping(source = "projets", target = "projetIds", qualifiedByName = "projetsToIds")
    @Mapping(source = "formations", target = "formationIds", qualifiedByName = "formationsToIds")
    EmployeDTO toDto(Employe employe);

    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "competenceEmployes", ignore = true)
    @Mapping(target = "evaluations", ignore = true)
    @Mapping(target = "testsTechniques", ignore = true)
    @Mapping(target = "messagesEnvoyes", ignore = true)
    @Mapping(target = "projets", ignore = true)
    @Mapping(target = "formations", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    Employe toEntity(EmployeDTO employeDTO);

    @Named("competenceEmployesToIds")
    static Set<String> competenceEmployesToIds(Set<CompetenceEmploye> competenceEmployes) {
        if (competenceEmployes == null) {
            return null;
        }
        return competenceEmployes.stream().map(CompetenceEmploye::getId).collect(Collectors.toSet());
    }

    @Named("evaluationsToIds")
    static Set<String> evaluationsToIds(Set<Evaluation> evaluations) {
        if (evaluations == null) {
            return null;
        }
        return evaluations.stream().map(Evaluation::getId).collect(Collectors.toSet());
    }

    @Named("testTechniquesToIds")
    static Set<String> testTechniquesToIds(Set<TestTechnique> testTechniques) {
        if (testTechniques == null) {
            return null;
        }
        return testTechniques.stream().map(TestTechnique::getId).collect(Collectors.toSet());
    }

    @Named("messagesToIds")
    static Set<String> messagesToIds(Set<Message> messages) {
        if (messages == null) {
            return null;
        }
        return messages.stream().map(Message::getId).collect(Collectors.toSet());
    }

    @Named("projetsToIds")
    static Set<String> projetsToIds(Set<Projet> projets) {
        if (projets == null) {
            return null;
        }
        return projets.stream().map(Projet::getId).collect(Collectors.toSet());
    }

    @Named("formationsToIds")
    static Set<String> formationsToIds(Set<Formation> formations) {
        if (formations == null) {
            return null;
        }
        return formations.stream().map(Formation::getId).collect(Collectors.toSet());
    }
}
