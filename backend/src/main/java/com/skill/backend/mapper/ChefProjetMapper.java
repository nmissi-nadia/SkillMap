package com.skill.backend.mapper;

import com.skill.backend.dto.ChefProjetDTO;
import com.skill.backend.entity.AffectationProjet;
import com.skill.backend.entity.ChefProjet;
import com.skill.backend.entity.Message;
import com.skill.backend.entity.Projet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ChefProjetMapper {

    ChefProjetMapper INSTANCE = Mappers.getMapper(ChefProjetMapper.class);

    @Mapping(source = "projets", target = "projetIds", qualifiedByName = "projetsToIds")
    @Mapping(source = "affectations", target = "affectationIds", qualifiedByName = "affectationsToIds")
    @Mapping(source = "messagesProjet", target = "messageProjetIds", qualifiedByName = "messagesToIds")
    ChefProjetDTO toDto(ChefProjet chefProjet);

    @Mapping(target = "projets", ignore = true)
    @Mapping(target = "affectations", ignore = true)
    @Mapping(target = "messagesProjet", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    ChefProjet toEntity(ChefProjetDTO chefProjetDTO);

    @Named("projetsToIds")
    static Set<String> projetsToIds(Set<Projet> projets) {
        if (projets == null) {
            return null;
        }
        return projets.stream().map(Projet::getId).collect(Collectors.toSet());
    }

    @Named("affectationsToIds")
    static Set<String> affectationsToIds(Set<AffectationProjet> affectations) {
        if (affectations == null) {
            return null;
        }
        return affectations.stream().map(AffectationProjet::getId).collect(Collectors.toSet());
    }

    @Named("messagesToIds")
    static Set<String> messagesToIds(Set<Message> messages) {
        if (messages == null) {
            return null;
        }
        return messages.stream().map(Message::getId).collect(Collectors.toSet());
    }
}
