package com.skill.backend.service;

import com.skill.backend.dto.*;
import com.skill.backend.entity.*;
import com.skill.backend.enums.RoleUtilisateur;
import com.skill.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;
    @Mock
    private CompetenceEmployeRepository competenceEmployeRepository;
    @Mock
    private FormationEmployeRepository formationEmployeRepository;
    @Mock
    private ProjetRepository projetRepository;
    @Mock
    private RHService rhService;
    @Mock
    private ManagerService managerService;

    @InjectMocks
    private DashboardService dashboardService;

    private Utilisateur utilisateur;

    @BeforeEach
    void setUp() {
        utilisateur = new Utilisateur();
        utilisateur.setId("user-1");
        utilisateur.setEmail("test@example.com");
    }

    @Test
    void getSummary_shouldThrowException_whenUserNotFound() {
        when(utilisateurRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> dashboardService.getSummary("unknown@example.com"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getSummary_shouldPopulateEmployeStats() {
        utilisateur.setRole(RoleUtilisateur.EMPLOYE);
        when(utilisateurRepository.findByEmail("test@example.com")).thenReturn(Optional.of(utilisateur));
        
        CompetenceEmploye ce = new CompetenceEmploye();
        ce.setNiveauManager(3);
        when(competenceEmployeRepository.findByEmployeId("user-1")).thenReturn(List.of(ce));
        when(formationEmployeRepository.findByEmployeIdAndStatut("user-1", "EN_COURS")).thenReturn(List.of(new FormationEmploye()));

        DashboardSummaryDTO summary = dashboardService.getSummary("test@example.com");

        assertThat(summary.getValidatedCompetencies()).isEqualTo(1);
        assertThat(summary.getOngoingFormations()).isEqualTo(1);
    }

    @Test
    void getSummary_shouldPopulateManagerStats() {
        utilisateur.setRole(RoleUtilisateur.MANAGER);
        when(utilisateurRepository.findByEmail("test@example.com")).thenReturn(Optional.of(utilisateur));
        
        TeamStatsDTO teamStats = new TeamStatsDTO();
        when(managerService.getTeamStats("test@example.com")).thenReturn(teamStats);

        DashboardSummaryDTO summary = dashboardService.getSummary("test@example.com");

        assertThat(summary.getTeamStats()).isNotNull();
    }

    @Test
    void getSummary_shouldPopulateRHStats() {
        utilisateur.setRole(RoleUtilisateur.RH);
        when(utilisateurRepository.findByEmail("test@example.com")).thenReturn(Optional.of(utilisateur));
        
        when(utilisateurRepository.count()).thenReturn(10L);
        when(rhService.getCriticalSkills("test@example.com")).thenReturn(List.of());
        
        SkillsMapDTO map = new SkillsMapDTO();
        map.setRepartitionParCategorie(Map.of(com.skill.backend.enums.TypeCompetence.HARD, 5L));
        when(rhService.getCompanySkillsMap("test@example.com", null, null, null)).thenReturn(map);

        DashboardSummaryDTO summary = dashboardService.getSummary("test@example.com");

        assertThat(summary.getTotalUsers()).isEqualTo(10);
        assertThat(summary.getSkillDistribution()).containsKey("HARD");
    }

    @Test
    void getSummary_shouldPopulateChefProjetStats() {
        utilisateur.setRole(RoleUtilisateur.CHEF_PROJET);
        when(utilisateurRepository.findByEmail("test@example.com")).thenReturn(Optional.of(utilisateur));
        
        Projet p = new Projet();
        p.setStatut("EN_COURS");
        p.setProgression(75);
        when(projetRepository.findByChefProjetId("user-1")).thenReturn(List.of(p));

        DashboardSummaryDTO summary = dashboardService.getSummary("test@example.com");

        assertThat(summary.getActiveProjectsCount()).isEqualTo(1);
        assertThat(summary.getAvgProjectProgression()).isEqualTo(75.0);
    }
}
