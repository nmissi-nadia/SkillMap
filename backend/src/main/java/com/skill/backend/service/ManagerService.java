package com.skill.backend.service;

import com.skill.backend.dto.*;
import com.skill.backend.entity.*;
import com.skill.backend.enums.RoleUtilisateur;
import com.skill.backend.mapper.EmployeMapper;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagerService {

    private final ManagerRepository managerRepository;
    private final EmployeRepository employeRepository;
    private final EmployeMapper employeMapper;
    private final com.skill.backend.mapper.CompetenceEmployeMapper competenceEmployeMapper;
    private final com.skill.backend.mapper.TestEmployeMapper testEmployeMapper;
    private final UtilisateurRepository utilisateurRepository;
    private final EvaluationRepository evaluationRepository;
    private final TestEmployeRepository testEmployeRepository;
    private final ProjetRepository projetRepository;
    private final CompetenceEmployeRepository competenceEmployeRepository;

    private Manager getManagerByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (utilisateur.getRole() != RoleUtilisateur.MANAGER) {
            throw new RuntimeException("L'utilisateur n'est pas un manager");
        }
        
        if (utilisateur instanceof Manager) {
            return (Manager) utilisateur;
        }
        
        return managerRepository.findById(utilisateur.getId())
                .orElseThrow(() -> new RuntimeException("Manager non trouvé pour l'ID: " + utilisateur.getId()));
    }

    public List<EmployeDTO> getMyTeam(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        return employeRepository.findByManagerId(manager.getId()).stream()
                .map(employeMapper::toDto)
                .collect(Collectors.toList());
    }

    public TeamStatsDTO getTeamStats(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        String managerId = manager.getId();
        List<Employe> team = employeRepository.findByManagerId(managerId);

        TeamStatsDTO stats = new TeamStatsDTO();
        stats.setNombreEmployes(team.size());

        // Niveau Moyen et Compétences
        double sumNiveaux = 0;
        int countComps = 0;
        Map<String, List<Integer>> compLevels = new HashMap<>();

        for (Employe emp : team) {
            for (CompetenceEmploye ce : emp.getCompetenceEmployes()) {
                int level = ce.getNiveauAuto(); // On utilise le niveau auto par défaut ou manager si validé
                if (ce.getNiveauManager() > 0) level = ce.getNiveauManager();
                
                sumNiveaux += level;
                countComps++;
                
                compLevels.computeIfAbsent(ce.getCompetence().getNom(), k -> new ArrayList<>()).add(level);
            }
        }

        stats.setNiveauMoyenEquipe(countComps > 0 ? sumNiveaux / countComps : 0.0);

        // Fortes vs Faibles (basé sur la moyenne par compétence)
        List<Map.Entry<String, Double>> avgByComp = compLevels.entrySet().stream()
                .map(e -> Map.entry(e.getKey(), e.getValue().stream().mapToInt(i -> i).average().orElse(0.0)))
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .collect(Collectors.toList());

        stats.setCompetencesFortes(avgByComp.stream().limit(3).map(Map.Entry::getKey).collect(Collectors.toList()));
        Collections.reverse(avgByComp);
        stats.setCompetencesFaibles(avgByComp.stream().limit(3).map(Map.Entry::getKey).collect(Collectors.toList()));

        // Comptes
        stats.setEvaluationsEnAttente((int) evaluationRepository.countByManagerIdAndStatut(managerId, "EN_ATTENTE"));
        stats.setTestsEnCours((int) testEmployeRepository.countByManagerIdAndStatutIn(managerId, Arrays.asList("ASSIGNED", "IN_PROGRESS")));
        stats.setProjetsActifs(manager.getProjets().size());

        return stats;
    }

    public EmployeDTO getTeamMemberDetails(String managerEmail, String employeId) {
        Manager manager = getManagerByEmail(managerEmail);
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        if (!employe.getManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Cet employé n'appartient pas à votre équipe");
        }

        return employeMapper.toDto(employe);
    }

    public List<PendingEvaluationDTO> getPendingEvaluations(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        return evaluationRepository.findByManagerAndStatut(manager, "EN_ATTENTE").stream()
                .filter(eval -> eval.getEmploye() != null && eval.getCompetence() != null)
                .map(eval -> new PendingEvaluationDTO(
                        eval.getId(),
                        new PendingEvaluationDTO.EmployeSimpleDTO(
                                eval.getEmploye().getId(), 
                                eval.getEmploye().getNom() != null ? eval.getEmploye().getNom() : "Inconnu", 
                                eval.getEmploye().getPrenom() != null ? eval.getEmploye().getPrenom() : ""
                        ),
                        new PendingEvaluationDTO.CompetenceSimpleDTO(
                                eval.getCompetence().getId(), 
                                eval.getCompetence().getNom() != null ? eval.getCompetence().getNom() : "Sans nom"
                        ),
                        eval.getNiveauAutoEvalue() != null ? eval.getNiveauAutoEvalue() : 0,
                        eval.getCommentaireEmploye(),
                        eval.getDateEvaluation() != null ? eval.getDateEvaluation().toLocalDate() : null, // Utilisation de dateEvaluation par défaut
                        eval.getStatut()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public CompetenceEmployeDTO validateEvaluation(String managerEmail, String evaluationId, ValidationRequestDTO request) {
        Manager manager = getManagerByEmail(managerEmail);
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));

        if (!evaluation.getManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Accès refusé à cette évaluation");
        }

        evaluation.setNiveauValide(request.getNiveauManager());
        evaluation.setCommentaireManager(request.getCommentaireManager());
        evaluation.setStatut(Boolean.TRUE.equals(request.getValide()) ? "VALIDEE" : "AJUSTEE");
        evaluation.setDateValidation(LocalDateTime.now());
        evaluationRepository.save(evaluation);

        // Mettre à jour CompetenceEmploye
        CompetenceEmploye ce = competenceEmployeRepository.findByEmployeIdAndCompetenceId(
                evaluation.getEmploye().getId(), evaluation.getCompetence().getId())
                .orElse(new CompetenceEmploye());
        
        if (ce.getId() == null) {
            ce.setEmploye(evaluation.getEmploye());
            ce.setCompetence(evaluation.getCompetence());
        }
        ce.setNiveauManager(request.getNiveauManager());
        ce.setDateEvaluation(evaluation.getDateValidation().toLocalDate());
        ce.setCommentaire(request.getCommentaireManager());
        
        return competenceEmployeMapper.toDto(competenceEmployeRepository.save(ce));
    }

    public List<CompetenceEmployeDTO> getEvaluationHistory(String managerEmail, String employeId) {
        Manager manager = getManagerByEmail(managerEmail);
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        if (!manager.getId().equals(employe.getManager() != null ? employe.getManager().getId() : null)) {
            throw new RuntimeException("Cet employé n'appartient pas à votre équipe");
        }

        return competenceEmployeRepository.findByEmploye(employe).stream()
                .map(competenceEmployeMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<TestEmployeDTO> getAssignedTests(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        return testEmployeRepository.findByManagerId(manager.getId()).stream()
                .map(testEmployeMapper::toDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public void assignEmployeToManager(String managerEmail, String employeId) {
        Manager manager = getManagerByEmail(managerEmail);
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        employe.setManager(manager);
        employeRepository.save(employe);
    }

    public List<EmployeDTO> getAvailableEmployes() {
        return employeRepository.findAll().stream()
                .filter(e -> e.getManager() == null)
                .map(employeMapper::toDto)
                .collect(Collectors.toList());
    }
}

