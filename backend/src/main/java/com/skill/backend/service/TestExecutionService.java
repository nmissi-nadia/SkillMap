package com.skill.backend.service;

import com.skill.backend.dto.ResultatTestDTO;
import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.entity.ReponseEmploye;
import com.skill.backend.entity.TestEmploye;
import com.skill.backend.exception.BadRequestException;
import com.skill.backend.exception.ResourceNotFoundException;
import com.skill.backend.mapper.TestEmployeMapper;
import com.skill.backend.repository.QuestionRepository;
import com.skill.backend.repository.TestEmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TestExecutionService {

    private final TestEmployeRepository testEmployeRepository;
    private final QuestionRepository questionRepository;
    private final TestEmployeMapper testEmployeMapper;
    private final EvaluationService evaluationService;

    /**
     * Démarre un test : passe le statut de ASSIGNED à IN_PROGRESS.
     */
    @Transactional
    public TestEmployeDTO startTest(String testEmployeId) {
        TestEmploye testEmploye = getTestEmploye(testEmployeId);

        if ("COMPLETED".equals(testEmploye.getStatut())) {
            throw new BadRequestException("Ce test est déjà terminé et ne peut plus être démarré.");
        }
        
        // Si déjà en cours, on ne fait rien et on retourne le DTO (Idempotence)
        if ("IN_PROGRESS".equals(testEmploye.getStatut())) {
            return testEmployeMapper.toDto(testEmploye);
        }

        if (!"ASSIGNED".equals(testEmploye.getStatut())) {
            throw new BadRequestException(
                "Le test ne peut être démarré que depuis le statut ASSIGNED. Statut actuel : " + testEmploye.getStatut()
            );
        }

        testEmploye.setStatut("IN_PROGRESS");
        TestEmploye saved = testEmployeRepository.save(testEmploye);
        return testEmployeMapper.toDto(saved);
    }

    /**
     * Soumet les réponses d'un test.
     * @param testEmployeId  ID du TestEmploye
     * @param reponsesMap    Map<questionId, reponse>
     */
    @Transactional
    public ResultatTestDTO submitTest(String testEmployeId, Map<String, String> reponsesMap) {
        TestEmploye testEmploye = getTestEmploye(testEmployeId);

        if ("COMPLETED".equals(testEmploye.getStatut())) {
            throw new BadRequestException("Ce test a déjà été soumis.");
        }
        if (!"IN_PROGRESS".equals(testEmploye.getStatut())) {
            throw new BadRequestException(
                "Le test doit être en cours (IN_PROGRESS) pour être soumis. Statut actuel : " + testEmploye.getStatut()
            );
        }

        // Enregistrer les réponses
        for (Map.Entry<String, String> entry : reponsesMap.entrySet()) {
            String questionId = entry.getKey();
            String reponse = entry.getValue();

            questionRepository.findById(questionId).ifPresent(question -> {
                ReponseEmploye reponseEmploye = new ReponseEmploye();
                reponseEmploye.setTestEmploye(testEmploye);
                reponseEmploye.setQuestion(question);
                reponseEmploye.setReponse(reponse);
                // La correction est faite dans EvaluationService
                boolean estCorrect = reponse != null && reponse.trim().equalsIgnoreCase(
                    question.getBonneReponse() != null ? question.getBonneReponse().trim() : ""
                );
                reponseEmploye.setEstCorrect(estCorrect);
                testEmploye.getReponses().add(reponseEmploye);
            });
        }

        testEmploye.setDateSoumission(LocalDateTime.now());
        testEmployeRepository.save(testEmploye);

        // Déléguer à EvaluationService pour le score et la mise à jour des compétences
        return evaluationService.evaluate(testEmploye);
    }

    // ---- Helper ----

    private TestEmploye getTestEmploye(String testEmployeId) {
        return testEmployeRepository.findById(testEmployeId)
                .orElseThrow(() -> new ResourceNotFoundException("TestEmploye", "id", testEmployeId));
    }
}
