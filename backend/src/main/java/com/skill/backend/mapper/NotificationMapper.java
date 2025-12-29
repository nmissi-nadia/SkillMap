package com.skill.backend.mapper;

import com.skill.backend.dto.NotificationDTO;
import com.skill.backend.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationMapper INSTANCE = Mappers.getMapper(NotificationMapper.class);

    @Mapping(source = "utilisateur.id", target = "utilisateurId")
    NotificationDTO toDto(Notification notification);

    @Mapping(source = "utilisateurId", target = "utilisateur.id")
    Notification toEntity(NotificationDTO notificationDTO);
}
