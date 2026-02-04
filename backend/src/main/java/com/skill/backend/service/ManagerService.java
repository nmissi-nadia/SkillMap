package com.skill.backend.service;

import com.skill.backend.dto.EmployeDTO;
import com.skill.backend.dto.PendingEvaluationDTO;
import com.skill.backend.dto.TeamStatsDTO;
import com.skill.backend.dto.ValidationRequestDTO;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Manager;
import com.skill.backend.entity.Utilisateur;
import com.skill.backend.enums.RoleUtilisateur;
import com.skill.backend.mapper.EmployeMapper;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.ManagerRepository;
import com.skill.backend.repository.UtilisateurRepository;
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
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Récupérer un manager par email (utilise l'héritage JOINED)
     */
    private Manager getManagerByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (utilisateur.getRole() != RoleUtilisateur.MANAGER) {
            throw new RuntimeException("L'utilisateur n'est pas un manager");
        }
        
        // Si déjà instance de Manager, l'utiliser directement
        if (utilisateur instanceof Manager) {
            return (Manager) utilisateur;
        }
        
        // Sinon, récupérer via ManagerRepository
        Manager manager = managerRepository.findById(utilisateur.getId())
                .orElseThrow(() -> new RuntimeException("Manager non trouvé pour l'ID: " + utilisateur.getId()));
        return manager;
    }

    /**
     * Récupérer la liste des employés d'un manager
     */
    public List<EmployeDTO> getMyTeam(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);

        List<Employe> employes = employeRepository.findByManagerId(manager.getId());
        
        return employes.stream()
                .map(employeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les statistiques de l'équipe
     */
    public TeamStatsDTO getTeamStats(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);

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
        Manager manager = getManagerByEmail(managerEmail);

        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        // Vérifier que l'employé appartient bien à l'équipe du manager
        if (!employe.getManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Cet employé n'appartient pas à votre équipe");
        }

        return employeMapper.toDto(employe);
    }

    /**
     * Récupérer les évaluations en attente de validation
     */
    public List<PendingEvaluationDTO> getPendingEvaluations(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);

        List<Employe> employes = employeRepository.findByManagerId(manager.getId());
        
        // Récupérer toutes les évaluations des employés de l'équipe
        // où niveauManager est null ou 0 (en attente de validation)
        List<PendingEvaluationDTO> pendingEvaluations = new ArrayList<>();
        
        for (Employe employe : employes) {
            // TODO: Implémenter la récupération des compétences en attente
            // Pour l'instant, retourne une liste vide
        }
        
        return pendingEvaluations;
    }

    /**
     * Valider une évaluation de compétence
     */
    public CompetenceEmploye validateEvaluation(String managerEmail, String evaluationId, 
                                                 ValidationRequestDTO request) {
        Manager manager = getManagerByEmail(managerEmail);

        // TODO: Implémenter la validation
        // 1. Récupérer la CompetenceEmploye
        // 2. Vérifier que l'employé appartient à l'équipe du manager
        // 3. Mettre à jour niveauManager et commentaire
        // 4. Sauvegarder
        
        throw new RuntimeException("Méthode non implémentée");
    }

    /**
     * Récupérer l'historique des évaluations d'un employé
     */
    public List<CompetenceEmploye> getEvaluationHistory(String managerEmail, String employeId) {
        Manager manager = getManagerByEmail(managerEmail);

        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        // Vérifier que l'employé appartient à l'équipe du manager
        if (!employe.getManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Cet employé n'appartient pas à votre équipe");
        }

        // TODO: Récupérer l'historique des évaluations
        return new ArrayList<>();
    }
}

