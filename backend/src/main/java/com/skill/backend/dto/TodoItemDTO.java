package com.skill.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TodoItemDTO {
    private String id;
    private String type; // EVALUATION, TEST, FORMATION
    private String title;
    private String priority; // HIGH, MEDIUM, LOW
    private LocalDate dueDate;
    private String status; // PENDING, IN_PROGRESS, COMPLETED
}
