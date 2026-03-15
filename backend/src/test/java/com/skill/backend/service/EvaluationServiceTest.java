package com.skill.backend.service;

import com.skill.backend.dto.ResultatTestDTO;
import com.skill.backend.entity.*;
import com.skill.backend.repository.CompetenceEmployeRepository;
import com.skill.backend.repository.CompetenceRepository;
import com.skill.backend.repository.TestEmployeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private TestEmployeRepository testEmployeRepository;
    @Mock
    private CompetenceEmployeRepository competenceEmployeRepository;
    @Mock
    private CompetenceRepository competenceRepository;

    @InjectMocks
    private EvaluationService evaluationService;

    private Employe employe;
    private TestTechnique testTechnique;
    private TestEmploye testEmploye;

    @BeforeEach
    void setUp() {
        employe = new Employe();
        employe.setId("emp-001");
        employe.setNom("Dupont");
        employe.setPrenom("Marie");

        testTechnique = new TestTechnique();
        testTechnique.setId("test-001");
        testTechnique.setTitre("Test Java");
        testTechnique.setCompetenceId("comp-001");
        testTechnique.setQuestions(new ArrayList<>());

        testEmploye = new TestEmploye();
        testEmploye.setId("te-001");
        testEmploye.setTestTechnique(testTechnique);
        testEmploye.setEmploye(employe);
        testEmploye.setStatut("IN_PROGRESS");
        testEmploye.setDateSoumission(LocalDateTime.now());
        testEmploye.setReponses(new ArrayList<>());
    }

    // ─────────── Calcul du niveau de compétence ───────────

    @Test
    void calculateNiveauCompetence_shouldReturn4_whenScoreIsAbove80() {
        assertThat(evaluationService.calculateNiveauCompetence(80.0)).isEqualTo(4);
        assertThat(evaluationService.calculateNiveauCompetence(95.0)).isEqualTo(4);
        assertThat(evaluationService.calculateNiveauCompetence(100.0)).isEqualTo(4);
    }

    @Test
    void calculateNiveauCompetence_shouldReturn3_whenScoreBetween60and79() {
        assertThat(evaluationService.calculateNiveauCompetence(60.0)).isEqualTo(3);
        assertThat(evaluationService.calculateNiveauCompetence(75.0)).isEqualTo(3);
        assertThat(evaluationService.calculateNiveauCompetence(79.9)).isEqualTo(3);
    }

    @Test
    void calculateNiveauCompetence_shouldReturn2_whenScoreBetween40and59() {
        assertThat(evaluationService.calculateNiveauCompetence(40.0)).isEqualTo(2);
        assertThat(evaluationService.calculateNiveauCompetence(55.0)).isEqualTo(2);
        assertThat(evaluationService.calculateNiveauCompetence(59.9)).isEqualTo(2);
    }

    @Test
    void calculateNiveauCompetence_shouldReturn1_whenScoreBelow40() {
        assertThat(evaluationService.calculateNiveauCompetence(39.9)).isEqualTo(1);
        assertThat(evaluationService.calculateNiveauCompetence(0.0)).isEqualTo(1);
    }

    // ─────────── Évaluation complète ───────────

    @Test
    void evaluate_shouldCalculateScoreCorrectly() {
        // Q1: 10 pts, bonne réponse
        Question q1 = buildQuestion("q-1", "Bonne réponse A", 10);
        ReponseEmploye r1 = buildReponse(q1, "Bonne réponse A", true);

        // Q2: 10 pts, mauvaise réponse
        Question q2 = buildQuestion("q-2", "Bonne réponse B", 10);
        ReponseEmploye r2 = buildReponse(q2, "Mauvaise réponse", false);

        testEmploye.getReponses().addAll(List.of(r1, r2));

        when(testEmployeRepository.save(any())).thenReturn(testEmploye);
        when(competenceRepository.findById("comp-001")).thenReturn(Optional.empty()); // skip competence update

        ResultatTestDTO resultat = evaluationService.evaluate(testEmploye);

        // 10/20 = 50%
        assertThat(resultat.getScore()).isEqualTo(50.0);
        assertThat(resultat.getStatut()).isEqualTo("COMPLETED");
        assertThat(resultat.getNiveauCompetenceAttribue()).isEqualTo(2); // 50% → niveau 2
        assertThat(resultat.getTotalPoints()).isEqualTo(20);
        assertThat(resultat.getPointsObtenus()).isEqualTo(10);
    }

    @Test
    void evaluate_shouldReturn4_whenAllAnswersCorrect() {
        Question q1 = buildQuestion("q-1", "Rep A", 10);
        Question q2 = buildQuestion("q-2", "Rep B", 10);
        ReponseEmploye r1 = buildReponse(q1, "Rep A", true);
        ReponseEmploye r2 = buildReponse(q2, "Rep B", true);

        testEmploye.getReponses().addAll(List.of(r1, r2));

        when(testEmployeRepository.save(any())).thenReturn(testEmploye);
        when(competenceRepository.findById("comp-001")).thenReturn(Optional.empty());

        ResultatTestDTO resultat = evaluationService.evaluate(testEmploye);

        assertThat(resultat.getScore()).isEqualTo(100.0);
        assertThat(resultat.getNiveauCompetenceAttribue()).isEqualTo(4);
    }

    @Test
    void evaluate_shouldUpdateStatutToCompleted() {
        testEmploye.getReponses().clear();

        when(testEmployeRepository.save(any())).thenReturn(testEmploye);
        when(competenceRepository.findById("comp-001")).thenReturn(Optional.empty());

        ResultatTestDTO resultat = evaluationService.evaluate(testEmploye);

        assertThat(resultat.getStatut()).isEqualTo("COMPLETED");
        assertThat(testEmploye.getStatut()).isEqualTo("COMPLETED");
    }

    @Test
    void evaluate_shouldUpdateCompetenceEmploye_whenCompetenceExists() {
        Competence competence = new Competence();
        competence.setId("comp-001");
        competence.setNom("Java");

        Question q = buildQuestion("q-1", "Rep A", 10);
        ReponseEmploye r = buildReponse(q, "Rep A", true);
        testEmploye.getReponses().add(r);

        when(testEmployeRepository.save(any())).thenReturn(testEmploye);
        when(competenceRepository.findById("comp-001")).thenReturn(Optional.of(competence));
        when(competenceEmployeRepository.findByEmploye(employe)).thenReturn(List.of());
        when(competenceEmployeRepository.save(any())).thenReturn(new CompetenceEmploye());

        evaluationService.evaluate(testEmploye);

        verify(competenceEmployeRepository, times(1)).save(any(CompetenceEmploye.class));
    }

    // ─────────── Helpers ───────────

    private Question buildQuestion(String id, String bonneReponse, int points) {
        Question q = new Question();
        q.setId(id);
        q.setContenu("Contenu de " + id);
        q.setBonneReponse(bonneReponse);
        q.setPoints(points);
        q.setTestTechnique(testTechnique);
        return q;
    }

    private ReponseEmploye buildReponse(Question question, String reponse, boolean correct) {
        ReponseEmploye r = new ReponseEmploye();
        r.setId("rep-" + question.getId());
        r.setQuestion(question);
        r.setReponse(reponse);
        r.setEstCorrect(correct);
        r.setTestEmploye(testEmploye);
        return r;
    }
}
