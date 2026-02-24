package com.skill.backend.mapper;

import com.skill.backend.dto.ProjetDTO;
import com.skill.backend.entity.Projet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProjetMapper {

    ProjetMapper INSTANCE = Mappers.getMapper(ProjetMapper.class);

    // On ignore les champs complexes gérés manuellement par ProjetService
    @Mapping(source = "chefProjet.id", target = "chefProjetId")
    @Mapping(target = "chefProjetNom", ignore = true)
    @Mapping(target = "nombreMembres", ignore = true)
    ProjetDTO toDto(Projet projet);

    @Mapping(target = "chefProjet", ignore = true)
    @Mapping(target = "employes", ignore = true)
    @Mapping(target = "messages", ignore = true)
    Projet toEntity(ProjetDTO projetDTO);
}
