package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AssignTestDTO {
    private String employeId;
    private String testId;
    private String competenceId;
    private LocalDateTime dateLimite;
}
