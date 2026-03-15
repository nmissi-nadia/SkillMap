package com.skill.backend.mapper;

import com.skill.backend.dto.QuestionDTO;
import com.skill.backend.entity.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    @Mapping(source = "testTechnique.id", target = "testId")
    QuestionDTO toDto(Question question);

    @Mapping(target = "testTechnique", ignore = true)
    Question toEntity(QuestionDTO questionDTO);
}
