package com.skill.backend.mapper;

import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.entity.TestEmploye;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TestEmployeMapper {

    @Mapping(source = "testTechnique.id", target = "testId")
    @Mapping(source = "testTechnique.titre", target = "testTitre")
    @Mapping(source = "employe.id", target = "employeId")
    @Mapping(expression = "java(testEmploye.getEmploye().getNom() + \" \" + testEmploye.getEmploye().getPrenom())", target = "employeNom")
    TestEmployeDTO toDto(TestEmploye testEmploye);

    @Mapping(target = "testTechnique", ignore = true)
    @Mapping(target = "employe", ignore = true)
    @Mapping(target = "reponses", ignore = true)
    TestEmploye toEntity(TestEmployeDTO testEmployeDTO);
}
