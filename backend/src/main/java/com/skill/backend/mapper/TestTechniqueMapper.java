package com.skill.backend.mapper;

import com.skill.backend.dto.TestTechniqueDTO;
import com.skill.backend.entity.TestTechnique;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TestTechniqueMapper {

    TestTechniqueMapper INSTANCE = Mappers.getMapper(TestTechniqueMapper.class);

    @Mapping(source = "employe.id", target = "employeId")
    @Mapping(source = "notification.id", target = "notificationId")
    TestTechniqueDTO toDto(TestTechnique testTechnique);

    @Mapping(source = "employeId", target = "employe.id")
    @Mapping(source = "notificationId", target = "notification.id")
    TestTechnique toEntity(TestTechniqueDTO testTechniqueDTO);
}
