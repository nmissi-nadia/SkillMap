package com.skill.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SubmitTestDTO {
    private Map<String, String> answers;  // questionId -> answer
}
