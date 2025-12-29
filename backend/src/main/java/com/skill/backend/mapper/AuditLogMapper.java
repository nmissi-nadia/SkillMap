package com.skill.backend.mapper;

import com.skill.backend.dto.AuditLogDTO;
import com.skill.backend.entity.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    AuditLogMapper INSTANCE = Mappers.getMapper(AuditLogMapper.class);

    AuditLogDTO toDto(AuditLog auditLog);

    AuditLog toEntity(AuditLogDTO auditLogDTO);
}
