package com.skill.backend.mapper;

import com.skill.backend.dto.UtilisateurDTO;
import com.skill.backend.entity.Utilisateur;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UtilisateurMapper {

    UtilisateurMapper INSTANCE = Mappers.getMapper(UtilisateurMapper.class);

    UtilisateurDTO toDto(Utilisateur utilisateur);

    Utilisateur toEntity(UtilisateurDTO utilisateurDTO);
}
