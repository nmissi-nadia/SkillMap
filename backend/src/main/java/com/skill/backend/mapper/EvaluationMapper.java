package com.skill.backend.mapper;

import com.skill.backend.dto.EvaluationDTO;
import com.skill.backend.entity.Evaluation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface EvaluationMapper {

    EvaluationMapper INSTANCE = Mappers.getMapper(EvaluationMapper.class);

    @Mapping(source = "employe.id", target = "employeId")
    @Mapping(source = "manager.id", target = "managerId")
    @Mapping(source = "auditLog.id", target = "auditLogId")
    EvaluationDTO toDto(Evaluation evaluation);

    @Mapping(source = "employeId", target = "employe.id")
    @Mapping(source = "managerId", target = "manager.id")
    @Mapping(source = "auditLogId", target = "auditLog.id")
    Evaluation toEntity(EvaluationDTO evaluationDTO);
}
