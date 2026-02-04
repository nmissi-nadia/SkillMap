package com.skill.backend.service;

import com.skill.backend.dto.EmployeDTO;
import com.skill.backend.dto.TeamStatsDTO;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Manager;
import com.skill.backend.mapper.EmployeMapper;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.ManagerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagerService {

    private final ManagerRepository managerRepository;
    private final EmployeRepository employeRepository;
    private final EmployeMapper employeMapper;

    /**
     * Récupérer la liste des employés d'un manager
     */
    public List<EmployeDTO> getMyTeam(String managerEmail) {
        Manager manager = managerRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager non trouvé"));

        List<Employe> employes = employeRepository.findByManagerId(manager.getId());
        
        return employes.stream()
                .map(employeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les statistiques de l'équipe
     */
    public TeamStatsDTO getTeamStats(String managerEmail) {
        Manager manager = managerRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager non trouvé"));

        List<Employe> employes = employeRepository.findByManagerId(manager.getId());

        TeamStatsDTO stats = new TeamStatsDTO();
        stats.setNombreEmployes(employes.size());

        // Calculer le niveau moyen de l'équipe
        // TODO: Implémenter le calcul réel basé sur les compétences
        stats.setNiveauMoyenEquipe(0.0);

        // Compétences fortes et faibles
        // TODO: Analyser les compétences de l'équipe
        stats.setCompetencesFortes(new ArrayList<>());
        stats.setCompetencesFaibles(new ArrayList<>());

        // Évaluations en attente
        // TODO: Compter les évaluations en attente de validation
        stats.setEvaluationsEnAttente(0);

        // Tests en cours
        // TODO: Compter les tests assignés non terminés
        stats.setTestsEnCours(0);

        // Projets actifs
        // TODO: Compter les projets actifs du manager
        stats.setProjetsActifs(0);

        return stats;
    }

    /**
     * Récupérer les détails d'un employé de l'équipe
     */
    public EmployeDTO getTeamMemberDetails(String managerEmail, String employeId) {
        Manager manager = managerRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager non trouvé"));

        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        // Vérifier que l'employé appartient bien à l'équipe du manager
        if (!employe.getManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Cet employé n'appartient pas à votre équipe");
        }

        return employeMapper.toDto(employe);
    }
}
