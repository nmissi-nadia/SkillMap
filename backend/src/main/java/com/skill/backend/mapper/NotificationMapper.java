package com.skill.backend.mapper;

import com.skill.backend.dto.NotificationDTO;
import com.skill.backend.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper MapStruct pour convertir Notification <-> NotificationDTO.
 */
@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "lu", source = "lu")
    @Mapping(target = "senderId", source = "senderId")
    @Mapping(target = "senderNom", source = "senderNom")
    @Mapping(target = "lien", source = "lien")
    NotificationDTO toDto(Notification notification);

    @Mapping(target = "utilisateur", ignore = true)
    Notification toEntity(NotificationDTO dto);
}
