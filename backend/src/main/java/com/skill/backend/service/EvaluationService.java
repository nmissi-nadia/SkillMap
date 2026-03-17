package com.skill.backend.service;

import com.skill.backend.entity.Evaluation;
import com.skill.backend.entity.TestEmploye;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Competence;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.entity.ReponseEmploye;
import com.skill.backend.dto.ResultatTestDTO;
import com.skill.backend.repository.EvaluationRepository;
import com.skill.backend.repository.CompetenceEmployeRepository;
import com.skill.backend.repository.CompetenceRepository;
import com.skill.backend.repository.TestEmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final TestEmployeRepository testEmployeRepository;
    private final CompetenceEmployeRepository competenceEmployeRepository;
    private final CompetenceRepository competenceRepository;
    private final EvaluationRepository evaluationRepository;

    /**
     * Calcule le score, met à jour le statut du TestEmploye et actualise
     * le niveau de compétence de l'employé dans CompetenceEmploye.
     *
     * @param testEmploye Le TestEmploye contenant les réponses soumises
     * @return ResultatTestDTO avec le score et le niveau de compétence attribué
     */
    @Transactional
    public ResultatTestDTO evaluate(TestEmploye testEmploye) {
        List<ReponseEmploye> reponses = testEmploye.getReponses();

        // Calcul du score (pondéré par les points de chaque question)
        int totalPoints = reponses.stream()
                .mapToInt(r -> (r.getQuestion() != null && r.getQuestion().getPoints() != null) ? r.getQuestion().getPoints() : 0)
                .sum();

        int pointsObtenus = reponses.stream()
                .filter(r -> Boolean.TRUE.equals(r.getEstCorrect()))
                .mapToInt(r -> (r.getQuestion() != null && r.getQuestion().getPoints() != null) ? r.getQuestion().getPoints() : 0)
                .sum();

        double scorePercent = (totalPoints > 0) ? ((double) pointsObtenus / totalPoints) * 100.0 : 0.0;

        // Niveau de compétence selon le score
        int niveauCompetence = calculateNiveauCompetence(scorePercent);

        // Mettre à jour le TestEmploye
        testEmploye.setScore(scorePercent);
        testEmploye.setStatut("COMPLETED");
        TestEmploye saved = testEmployeRepository.save(testEmploye);

        // Mettre à jour la compétence de l'employé
        String competenceId = (testEmploye.getTestTechnique() != null) ? testEmploye.getTestTechnique().getCompetenceId() : null;
        if (competenceId != null && !competenceId.isEmpty()) {
            updateCompetenceEmploye(testEmploye.getEmploye(), competenceId, niveauCompetence);
        }

        // Créer une évaluation liée au test
        createEvaluationFromTest(testEmploye, niveauCompetence, scorePercent);

        // Construire le résultat
        ResultatTestDTO resultat = new ResultatTestDTO();
        resultat.setTestEmployeId(saved.getId());
        resultat.setEmployeId(testEmploye.getEmploye() != null ? testEmploye.getEmploye().getId() : null);
        
        if (testEmploye.getTestTechnique() != null) {
            resultat.setTestId(testEmploye.getTestTechnique().getId());
            resultat.setTestTitre(testEmploye.getTestTechnique().getTitre());
        }
        
        resultat.setScore(scorePercent);
        resultat.setStatut("COMPLETED");
        resultat.setNiveauCompetenceAttribue(niveauCompetence);
        resultat.setCompetenceId(competenceId);
        resultat.setDateSoumission(testEmploye.getDateSoumission());
        resultat.setTotalPoints(totalPoints);
        resultat.setPointsObtenus(pointsObtenus);
        return resultat;
    }

    /**
     * Calcule le niveau de compétence basé sur le score en pourcentage.
     * >= 80% → 4 | >= 60% → 3 | >= 40% → 2 | sinon → 1
     */
    public int calculateNiveauCompetence(double scorePercent) {
        if (scorePercent >= 80) return 4;
        if (scorePercent >= 60) return 3;
        if (scorePercent >= 40) return 2;
        return 1;
    }

    /**
     * Met à jour ou crée un enregistrement CompetenceEmploye pour refléter
     * le niveau obtenu au test.
     */
    private void updateCompetenceEmploye(Employe employe, String competenceId, int niveauAuto) {
        if (employe == null || competenceId == null) return;
        
        Competence competence = competenceRepository.findById(competenceId).orElse(null);
        if (competence == null) return;

        List<CompetenceEmploye> existants = competenceEmployeRepository.findByEmploye(employe);
        CompetenceEmploye ce = (existants != null) ? existants.stream()
                .filter(c -> c.getCompetence() != null && competenceId.equals(c.getCompetence().getId()))
                .findFirst()
                .orElse(new CompetenceEmploye()) : new CompetenceEmploye();

        if (ce.getId() == null) {
            ce.setEmploye(employe);
            ce.setCompetence(competence);
        }

        ce.setNiveauAuto(niveauAuto);
        ce.setDateEvaluation(LocalDate.now());
        ce.setCommentaire("Niveau mis à jour automatiquement suite au test technique");
        competenceEmployeRepository.save(ce);
    }

    /**
     * Crée une évaluation basée sur le résultat du test technique.
     */
    private void createEvaluationFromTest(TestEmploye testEmploye, int niveauCompetence, double scorePercent) {
        Evaluation evaluation = new Evaluation();
        evaluation.setType("test");
        evaluation.setScore(scorePercent);
        
        String titreTest = (testEmploye.getTestTechnique() != null) ? testEmploye.getTestTechnique().getTitre() : "Inconnu";
        evaluation.setCommentaire("Évaluation automatique suite au test technique: " + titreTest);
        
        evaluation.setEmploye(testEmploye.getEmploye());
        evaluation.setManager(testEmploye.getManager());
        
        String compId = (testEmploye.getTestTechnique() != null) ? testEmploye.getTestTechnique().getCompetenceId() : null;
        if (compId != null && !compId.isEmpty()) {
            evaluation.setCompetence(competenceRepository.findById(compId).orElse(null));
        }
        
        evaluation.setNiveauAutoEvalue(niveauCompetence);
        evaluation.setNiveauValide(niveauCompetence); // Auto-validé pour les tests
        evaluation.setCommentaireEmploye("Test passé automatiquement");
        evaluation.setCommentaireManager("Validation automatique du test technique");
        evaluation.setStatut("VALIDEE");
        evaluationRepository.save(evaluation);
    }
}
