package com.skill.backend.service;

import com.skill.backend.dto.*;
import com.skill.backend.entity.*;
import com.skill.backend.enums.RoleUtilisateur;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UtilisateurRepository utilisateurRepository;
    private final CompetenceEmployeRepository competenceEmployeRepository;
    private final FormationEmployeRepository formationEmployeRepository;
    private final ProjetRepository projetRepository;
    private final RHService rhService;
    private final ManagerService managerService;

    public DashboardSummaryDTO getSummary(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        DashboardSummaryDTO.DashboardSummaryDTOBuilder builder = DashboardSummaryDTO.builder();

        if (user.getRole() == RoleUtilisateur.EMPLOYE) {
            populateEmployeStats(builder, user.getId());
        } else if (user.getRole() == RoleUtilisateur.MANAGER) {
            builder.teamStats(managerService.getTeamStats(email));
        } else if (user.getRole() == RoleUtilisateur.RH) {
            populateRHStats(builder, email);
        } else if (user.getRole() == RoleUtilisateur.CHEF_PROJET) {
            populateChefProjetStats(builder, user.getId());
        }

        return builder.build();
    }

    private void populateEmployeStats(DashboardSummaryDTO.DashboardSummaryDTOBuilder builder, String employeId) {
        List<CompetenceEmploye> comps = competenceEmployeRepository.findByEmployeId(employeId);
        long validated = comps.stream()
                .filter(ce -> ce.getNiveauManager() > 0)
                .count();
        
        long ongoing = formationEmployeRepository.findByEmployeIdAndStatut(employeId, "EN_COURS").size();
        
        builder.validatedCompetencies((int) validated);
        builder.ongoingFormations((int) ongoing);
    }

    private void populateRHStats(DashboardSummaryDTO.DashboardSummaryDTOBuilder builder, String email) {
        builder.totalUsers(utilisateurRepository.count());
        builder.criticalSkillsCount((long) rhService.getCriticalSkills(email).size());
        
        SkillsMapDTO map = rhService.getCompanySkillsMap(email, null, null, null);
        if (map.getRepartitionParCategorie() != null) {
            Map<String, Long> dist = map.getRepartitionParCategorie().entrySet().stream()
                    .collect(Collectors.toMap(e -> e.getKey().name(), Map.Entry::getValue));
            builder.skillDistribution(dist);
        }
        
        // Budget total (somme simplifiée)
        // Note: une vraie implémentation sommerait les coûts des formations validées/en cours
    }

    private void populateChefProjetStats(DashboardSummaryDTO.DashboardSummaryDTOBuilder builder, String chefProjetId) {
        List<Projet> projets = projetRepository.findByChefProjetId(chefProjetId);
        long active = projets.stream().filter(p -> "EN_COURS".equals(p.getStatut())).count();
        double avg = projets.stream()
                .filter(p -> p.getProgression() != null)
                .mapToInt(p -> p.getProgression())
                .average()
                .orElse(0.0);
        
        builder.activeProjectsCount(active);
        builder.avgProjectProgression(avg);
    }
}
