package com.skill.backend.mapper;

import com.skill.backend.dto.RHDTO;
import com.skill.backend.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RHMapper {

    RHMapper INSTANCE = Mappers.getMapper(RHMapper.class);

    @Mapping(source = "formations", target = "formationIds", qualifiedByName = "formationsToIds")
    @Mapping(source = "projets", target = "projetIds", qualifiedByName = "projetsToIds")
    @Mapping(source = "notifications", target = "notificationIds", qualifiedByName = "notificationsToIds")
    @Mapping(source = "auditLogs", target = "auditLogIds", qualifiedByName = "auditLogsToIds")
    RHDTO toDto(RH rh);

    @Mapping(target = "formations", ignore = true)
    @Mapping(target = "projets", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "auditLogs", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    RH toEntity(RHDTO rhdto);

    @Named("formationsToIds")
    static Set<String> formationsToIds(Set<Formation> formations) {
        if (formations == null) {
            return null;
        }
        return formations.stream().map(Formation::getId).collect(Collectors.toSet());
    }

    @Named("projetsToIds")
    static Set<String> projetsToIds(Set<Projet> projets) {
        if (projets == null) {
            return null;
        }
        return projets.stream().map(Projet::getId).collect(Collectors.toSet());
    }

    @Named("notificationsToIds")
    static Set<String> notificationsToIds(Set<Notification> notifications) {
        if (notifications == null) {
            return null;
        }
        return notifications.stream().map(Notification::getId).collect(Collectors.toSet());
    }

    @Named("auditLogsToIds")
    static Set<String> auditLogsToIds(Set<AuditLog> auditLogs) {
        if (auditLogs == null) {
            return null;
        }
        return auditLogs.stream().map(AuditLog::getId).collect(Collectors.toSet());
    }
}
