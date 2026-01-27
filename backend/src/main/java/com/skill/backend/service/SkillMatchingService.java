package com.skill.backend.service;

import com.skill.backend.dto.CompetenceMatchDTO;
import com.skill.backend.dto.EmployeeMatchDTO;
import com.skill.backend.dto.EmployeeMatchDetailDTO;
import com.skill.backend.dto.MatchingAnalyticsDTO;
import com.skill.backend.entity.*;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillMatchingService {

    private final EmployeRepository employeRepository;
    private final ProjetRepository projetRepository;
    private final CompetenceRequiseProjetRepository competenceRequiseProjetRepository;
    private final CompetenceEmployeRepository competenceEmployeRepository;
    private final AffectationProjetRepository affectationProjetRepository;
    private final AuditLogService auditLogService;

    /**
     * Trouver les meilleurs employés pour un projet
     */
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    public List<EmployeeMatchDTO> findBestMatchesForProject(String projetId, Integer minScore) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        // Récupérer les compétences requises
        List<CompetenceRequiseProjet> competencesRequises = 
                competenceRequiseProjetRepository.findByProjetId(projetId);

        if (competencesRequises.isEmpty()) {
            throw new RuntimeException("Aucune compétence requise définie pour ce projet");
        }

        // Récupérer tous les employés
        List<Employe> employes = employeRepository.findAll();

        // Calculer le score de matching pour chaque employé
        List<EmployeeMatchDTO> matches = employes.stream()
                .map(employe -> calculateMatch(employe, competencesRequises))
                .filter(match -> match.getMatchScore() >= (minScore != null ? minScore : 0))
                .sorted(Comparator.comparing(EmployeeMatchDTO::getMatchScore).reversed())
                .collect(Collectors.toList());

        // Audit log
        auditLogService.logAction("SYSTEM", "SKILL_MATCHING", "PROJET", 
            projetId, String.format("Matching effectué: %d candidats trouvés", matches.size()));

        return matches;
    }

    /**
     * Obtenir les détails du matching pour un employé spécifique
     */
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    public EmployeeMatchDetailDTO getMatchDetails(String projetId, String employeId) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        List<CompetenceRequiseProjet> competencesRequises = 
                competenceRequiseProjetRepository.findByProjetId(projetId);

        return calculateDetailedMatch(employe, competencesRequises);
    }

    /**
     * Obtenir les analytics du matching
     */
    @PreAuthorize("hasAnyRole('CHEF_PROJET', 'RH')")
    public MatchingAnalyticsDTO getMatchingAnalytics(String projetId) {
        List<EmployeeMatchDTO> matches = findBestMatchesForProject(projetId, 0);

        MatchingAnalyticsDTO analytics = new MatchingAnalyticsDTO();
        analytics.setTotalEmployes(matches.size());
        analytics.setEmployesDisponibles((int) matches.stream()
                .filter(m -> "DISPONIBLE".equals(m.getDisponibilite()))
                .count());
        analytics.setEmployesQualifies((int) matches.stream()
                .filter(m -> m.getMatchScore() >= 70)
                .count());
        
        double avgScore = matches.stream()
                .mapToDouble(EmployeeMatchDTO::getMatchScore)
                .average()
                .orElse(0.0);
        analytics.setScoreMatchMoyen(avgScore);

        // Recommandation
        if (analytics.getEmployesQualifies() >= 3) {
            analytics.setRecommandation("Excellent: plusieurs candidats qualifiés disponibles");
        } else if (analytics.getEmployesQualifies() >= 1) {
            analytics.setRecommandation("Bon: au moins un candidat qualifié trouvé");
        } else {
            analytics.setRecommandation("Attention: aucun candidat avec score >= 70%. Envisager formation ou recrutement");
        }

        return analytics;
    }

    /**
     * Calculer le score de matching pour un employé
     */
    private EmployeeMatchDTO calculateMatch(Employe employe, List<CompetenceRequiseProjet> competencesRequises) {
        EmployeeMatchDTO match = new EmployeeMatchDTO();
        match.setEmployeId(employe.getId());
        match.setEmployeNom(employe.getNom());
        match.setEmployePrenom(employe.getPrenom());
        match.setPoste(employe.getPoste());

        // Récupérer les compétences de l'employé
        List<CompetenceEmploye> competencesEmploye = competenceEmployeRepository.findByEmploye(employe);

        int totalCompetences = competencesRequises.size();
        int competencesMatched = 0;
        double scoreTotal = 0.0;

        for (CompetenceRequiseProjet requise : competencesRequises) {
            CompetenceEmploye ce = competencesEmploye.stream()
                    .filter(c -> c.getCompetence().getId().equals(requise.getCompetence().getId()))
                    .findFirst()
                    .orElse(null);

            if (ce != null) {
                int niveauEmploye = ce.getNiveauManager() != null ? ce.getNiveauManager() : ce.getNiveauAuto();
                int niveauRequis = requise.getNiveauRequis();

                // Calculer le score pour cette compétence
                double scoreCompetence = calculateCompetenceScore(niveauEmploye, niveauRequis, requise.getPriorite());
                scoreTotal += scoreCompetence;

                if (niveauEmploye >= niveauRequis) {
                    competencesMatched++;
                }
            }
            // Si compétence manquante, score = 0 pour cette compétence
        }

        // Score global (moyenne pondérée)
        double matchScore = totalCompetences > 0 ? (scoreTotal / totalCompetences) : 0.0;
        match.setMatchScore(Math.round(matchScore * 100.0) / 100.0);
        match.setCompetencesMatched(competencesMatched);
        match.setCompetencesRequired(totalCompetences);

        // Calculer la disponibilité
        int tauxAllocation = calculateCurrentAllocation(employe.getId());
        match.setTauxAllocationActuel(tauxAllocation);
        
        if (tauxAllocation <= 50) {
            match.setDisponibilite("DISPONIBLE");
        } else if (tauxAllocation <= 80) {
            match.setDisponibilite("PARTIELLEMENT");
        } else {
            match.setDisponibilite("INDISPONIBLE");
        }

        return match;
    }

    /**
     * Calculer le score pour une compétence spécifique
     */
    private double calculateCompetenceScore(int niveauEmploye, int niveauRequis, String priorite) {
        // Score de base selon le niveau
        double scoreBase;
        if (niveauEmploye >= niveauRequis) {
            // Parfait ou au-dessus
            scoreBase = 100.0;
            // Bonus si largement au-dessus
            if (niveauEmploye > niveauRequis) {
                scoreBase += (niveauEmploye - niveauRequis) * 5;
            }
        } else {
            // Insuffisant - pénalité proportionnelle
            int diff = niveauRequis - niveauEmploye;
            scoreBase = Math.max(0, 100 - (diff * 25));
        }

        // Pondération selon la priorité
        double ponderation = 1.0;
        if ("CRITIQUE".equals(priorite)) {
            ponderation = 1.5;
        } else if ("IMPORTANTE".equals(priorite)) {
            ponderation = 1.2;
        }

        return Math.min(100, scoreBase * ponderation);
    }

    /**
     * Calculer le taux d'allocation actuel d'un employé
     */
    private int calculateCurrentAllocation(String employeId) {
        List<AffectationProjet> affectations = affectationProjetRepository
                .findByEmployeIdAndStatut(employeId, "ACTIVE");
        
        return affectations.stream()
                .mapToInt(a -> a.getTauxAllocation() != null ? a.getTauxAllocation() : 0)
                .sum();
    }

    /**
     * Calculer le matching détaillé
     */
    private EmployeeMatchDetailDTO calculateDetailedMatch(Employe employe, List<CompetenceRequiseProjet> competencesRequises) {
        EmployeeMatchDetailDTO detail = new EmployeeMatchDetailDTO();
        detail.setEmployeId(employe.getId());
        detail.setEmployeNom(employe.getNom());
        detail.setEmployePrenom(employe.getPrenom());
        detail.setEmail(employe.getEmail());
        detail.setPoste(employe.getPoste());
        detail.setDepartement(employe.getDepartement());

        List<CompetenceEmploye> competencesEmploye = competenceEmployeRepository.findByEmploye(employe);
        List<CompetenceMatchDTO> matched = new ArrayList<>();
        List<CompetenceMatchDTO> missing = new ArrayList<>();
        double scoreTotal = 0.0;

        for (CompetenceRequiseProjet requise : competencesRequises) {
            CompetenceMatchDTO cm = new CompetenceMatchDTO();
            cm.setCompetenceId(requise.getCompetence().getId());
            cm.setCompetenceNom(requise.getCompetence().getNom());
            cm.setNiveauRequis(requise.getNiveauRequis());

            CompetenceEmploye ce = competencesEmploye.stream()
                    .filter(c -> c.getCompetence().getId().equals(requise.getCompetence().getId()))
                    .findFirst()
                    .orElse(null);

            if (ce != null) {
                int niveauEmploye = ce.getNiveauManager() != null ? ce.getNiveauManager() : ce.getNiveauAuto();
                cm.setNiveauEmploye(niveauEmploye);
                
                double score = calculateCompetenceScore(niveauEmploye, requise.getNiveauRequis(), requise.getPriorite());
                cm.setScoreMatch(score);
                scoreTotal += score;

                if (niveauEmploye >= requise.getNiveauRequis() + 1) {
                    cm.setStatut("PARFAIT");
                } else if (niveauEmploye >= requise.getNiveauRequis()) {
                    cm.setStatut("SUFFISANT");
                } else {
                    cm.setStatut("INSUFFISANT");
                }
                matched.add(cm);
            } else {
                cm.setNiveauEmploye(0);
                cm.setScoreMatch(0.0);
                cm.setStatut("MANQUANT");
                missing.add(cm);
            }
        }

        detail.setCompetencesMatched(matched);
        detail.setCompetencesMissing(missing);
        detail.setMatchScore(competencesRequises.size() > 0 ? 
                Math.round((scoreTotal / competencesRequises.size()) * 100.0) / 100.0 : 0.0);

        int tauxAllocation = calculateCurrentAllocation(employe.getId());
        detail.setTauxAllocationActuel(tauxAllocation);
        
        if (tauxAllocation <= 50) {
            detail.setDisponibilite("DISPONIBLE");
        } else if (tauxAllocation <= 80) {
            detail.setDisponibilite("PARTIELLEMENT");
        } else {
            detail.setDisponibilite("INDISPONIBLE");
        }

        return detail;
    }
}
