package com.skill.backend.service;

import com.skill.backend.entity.Evaluation;
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
                .mapToInt(r -> r.getQuestion().getPoints() != null ? r.getQuestion().getPoints() : 0)
                .sum();

        int pointsObtenus = reponses.stream()
                .filter(r -> Boolean.TRUE.equals(r.getEstCorrect()))
                .mapToInt(r -> r.getQuestion().getPoints() != null ? r.getQuestion().getPoints() : 0)
                .sum();

        double scorePercent = (totalPoints > 0) ? ((double) pointsObtenus / totalPoints) * 100.0 : 0.0;

        // Niveau de compétence selon le score
        int niveauCompetence = calculateNiveauCompetence(scorePercent);

        // Mettre à jour le TestEmploye
        testEmploye.setScore(scorePercent);
        testEmploye.setStatut("COMPLETED");
        TestEmploye saved = testEmployeRepository.save(testEmploye);

        // Mettre à jour la compétence de l'employé
        String competenceId = testEmploye.getTestTechnique().getCompetenceId();
        if (competenceId != null && !competenceId.isBlank()) {
            updateCompetenceEmploye(testEmploye.getEmploye(), competenceId, niveauCompetence);
        }

        // Créer une évaluation liée au test
        createEvaluationFromTest(testEmploye, niveauCompetence, scorePercent);

        // Construire le résultat
        ResultatTestDTO resultat = new ResultatTestDTO();
        resultat.setTestEmployeId(saved.getId());
        resultat.setEmployeId(testEmploye.getEmploye().getId());
        resultat.setTestId(testEmploye.getTestTechnique().getId());
        resultat.setTestTitre(testEmploye.getTestTechnique().getTitre());
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
        Competence competence = competenceRepository.findById(competenceId).orElse(null);
        if (competence == null) return;

        List<CompetenceEmploye> existants = competenceEmployeRepository.findByEmploye(employe);
        CompetenceEmploye ce = existants.stream()
                .filter(c -> c.getCompetence().getId().equals(competenceId))
                .findFirst()
                .orElse(new CompetenceEmploye());

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
        evaluation.setCommentaire("Évaluation automatique suite au test technique: " + testEmploye.getTestTechnique().getTitre());
        evaluation.setEmploye(testEmploye.getEmploye());
        evaluation.setManager(testEmploye.getManager());
        evaluation.setCompetence(competenceRepository.findById(testEmploye.getTestTechnique().getCompetenceId()).orElse(null));
        evaluation.setNiveauAutoEvalue(niveauCompetence);
        evaluation.setNiveauValide(niveauCompetence); // Auto-validé pour les tests
        evaluation.setCommentaireEmploye("Test passé automatiquement");
        evaluation.setCommentaireManager("Validation automatique du test technique");
        evaluation.setStatut("VALIDEE");
        evaluationRepository.save(evaluation);
    }
}
