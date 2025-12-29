package com.skill.backend.mapper;

import com.skill.backend.dto.ProjetDTO;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Message;
import com.skill.backend.entity.Projet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProjetMapper {

    ProjetMapper INSTANCE = Mappers.getMapper(ProjetMapper.class);

    @Mapping(source = "employes", target = "employeIds", qualifiedByName = "employesToIds")
    @Mapping(source = "chefProjet.id", target = "chefProjetId")
    @Mapping(source = "messages", target = "messageIds", qualifiedByName = "messagesToIds")
    ProjetDTO toDto(Projet projet);

    Projet toEntity(ProjetDTO projetDTO);

    @Named("employesToIds")
    static Set<String> employesToIds(Set<Employe> employes) {
        if (employes == null) {
            return null;
        }
        return employes.stream().map(Employe::getId).collect(Collectors.toSet());
    }

    @Named("messagesToIds")
    static Set<String> messagesToIds(Set<Message> messages) {
        if (messages == null) {
            return null;
        }
        return messages.stream().map(Message::getId).collect(Collectors.toSet());
    }
}
