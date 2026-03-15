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
    @Mapping(source = "testEmployes", target = "testTechniqueIds", qualifiedByName = "testEmployesToIds")
    @Mapping(source = "messagesEnvoyes", target = "messageEnvoyeIds", qualifiedByName = "messagesToIds")
    @Mapping(source = "projets", target = "projetIds", qualifiedByName = "projetsToIds")
    @Mapping(source = "inscriptionsFormation", target = "formationIds", qualifiedByName = "inscriptionsToIds")
    EmployeDTO toDto(Employe employe);

    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "competenceEmployes", ignore = true)
    @Mapping(target = "evaluations", ignore = true)
    @Mapping(target = "testEmployes", ignore = true)
    @Mapping(target = "messagesEnvoyes", ignore = true)
    @Mapping(target = "projets", ignore = true)
    @Mapping(target = "inscriptionsFormation", ignore = true)
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

    @Named("testEmployesToIds")
    static Set<String> testEmployesToIds(Set<TestEmploye> testEmployes) {
        if (testEmployes == null) {
            return null;
        }
        return testEmployes.stream().map(TestEmploye::getId).collect(Collectors.toSet());
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

    @Named("inscriptionsToIds")
    static Set<String> inscriptionsToIds(Set<InscriptionFormation> inscriptions) {
        if (inscriptions == null) {
            return null;
        }
        return inscriptions.stream().map(i -> i.getFormation().getId()).collect(Collectors.toSet());
    }
}
