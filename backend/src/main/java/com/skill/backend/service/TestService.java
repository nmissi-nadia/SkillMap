package com.skill.backend.service;

import com.skill.backend.dto.QuestionDTO;
import com.skill.backend.dto.TestDTO;
import com.skill.backend.entity.Question;
import com.skill.backend.entity.TestTechnique;
import com.skill.backend.exception.ResourceNotFoundException;
import com.skill.backend.mapper.QuestionMapper;
import com.skill.backend.repository.QuestionRepository;
import com.skill.backend.repository.TestTechniqueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestService {

    private final TestTechniqueRepository testTechniqueRepository;
    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;

    /**
     * Créer un nouveau test technique avec ses questions.
     */
    @Transactional
    public TestDTO createTest(TestDTO dto) {
        log.info("RECEIVED TestDTO: titre={}, competenceId={}, niveau={}, questions={}", 
                dto.getTitre(), dto.getCompetenceId(), dto.getNiveau(), 
                dto.getQuestions() != null ? dto.getQuestions().size() : "null");
        if (dto.getQuestions() != null) {
            dto.getQuestions().forEach(q -> log.info("  Question: {}, points={}", q.getContenu(), q.getPoints()));
        }
        try {
            TestTechnique test = new TestTechnique();
            test.setId(UUID.randomUUID().toString()); // Définition explicite de l'ID
            test.setTitre(dto.getTitre());
            test.setDescription(dto.getDescription());
            test.setCompetenceId(dto.getCompetenceId());
            test.setTechnologie(dto.getTechnologie());
            test.setNiveau(dto.getNiveau());
            test.setDureeMinutes(dto.getDureeMinutes() != null ? dto.getDureeMinutes() : 30);

            if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
                for (QuestionDTO qDto : dto.getQuestions()) {
                    Question question = questionMapper.toEntity(qDto);
                    if (question.getId() == null) {
                        question.setId(UUID.randomUUID().toString());
                    }
                    question.setTestTechnique(test);
                    test.getQuestions().add(question);
                    log.debug("Added question: {}", question.getContenu());
                }
            } else {
                log.warn("Attempt to create a test without questions: {}", dto.getTitre());
            }

            log.info("Saving test entity...");
            TestTechnique saved = testTechniqueRepository.save(test);
            log.info("Test saved successfully with ID: {}", saved.getId());
            return toTestDTO(saved);
        } catch (DataAccessException e) {
            log.error("Database error while creating test: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating test: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Récupérer tous les tests.
     */
    @Transactional(readOnly = true)
    public List<TestDTO> getAllTests() {
        return testTechniqueRepository.findAll().stream()
                .map(this::toTestDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer un test par son ID.
     */
    @Transactional(readOnly = true)
    public TestDTO getTestById(String id) {
        TestTechnique test = testTechniqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TestTechnique", "id", id));
        return toTestDTO(test);
    }

    // ---- Helper ----

    public TestDTO toTestDTO(TestTechnique test) {
        TestDTO dto = new TestDTO();
        dto.setId(test.getId());
        dto.setTitre(test.getTitre());
        dto.setDescription(test.getDescription());
        dto.setCompetenceId(test.getCompetenceId());
        dto.setTechnologie(test.getTechnologie());
        dto.setNiveau(test.getNiveau());
        dto.setDureeMinutes(test.getDureeMinutes());
        dto.setDateCreation(test.getDateCreation());
        List<QuestionDTO> questions = test.getQuestions().stream()
                .map(questionMapper::toDto)
                .collect(Collectors.toList());
        dto.setQuestions(questions);
        return dto;
    }
}
