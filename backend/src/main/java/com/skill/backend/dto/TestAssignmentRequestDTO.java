package com.skill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestAssignmentRequestDTO {
    private String testId;
    private String employeId;
    private LocalDateTime dateLimite;
}
