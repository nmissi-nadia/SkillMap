package com.skill.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardSummaryDTO {
    // Employe
    private Integer validatedCompetencies;
    private Integer ongoingFormations;
    private List<FormationDTO> upcomingFormations;
    
    // Manager
    private TeamStatsDTO teamStats;
    
    // RH
    private Long totalUsers;
    private Long criticalSkillsCount;
    private Double totalFormationBudget;
    private Map<String, Long> skillDistribution;
    
    // Chef Projet
    private Long activeProjectsCount;
    private Double avgProjectProgression;
}
