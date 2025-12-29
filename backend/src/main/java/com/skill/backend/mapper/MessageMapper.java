package com.skill.backend.mapper;

import com.skill.backend.dto.MessageDTO;
import com.skill.backend.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface MessageMapper {

    MessageMapper INSTANCE = Mappers.getMapper(MessageMapper.class);

    @Mapping(source = "expediteur.id", target = "expediteurId")
    @Mapping(source = "destinataire.id", target = "destinataireId")
    @Mapping(source = "projet.id", target = "projetId")
    MessageDTO toDto(Message message);

    @Mapping(source = "expediteurId", target = "expediteur.id")
    @Mapping(source = "destinataireId", target = "destinataire.id")
    @Mapping(source = "projetId", target = "projet.id")
    Message toEntity(MessageDTO messageDTO);
}
