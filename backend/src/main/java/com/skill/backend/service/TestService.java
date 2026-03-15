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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {

    private final TestTechniqueRepository testTechniqueRepository;
    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;

    /**
     * Créer un nouveau test technique avec ses questions.
     */
    @Transactional
    public TestDTO createTest(TestDTO dto) {
        TestTechnique test = new TestTechnique();
        test.setTitre(dto.getTitre());
        test.setDescription(dto.getDescription());
        test.setCompetenceId(dto.getCompetenceId());
        test.setNiveau(dto.getNiveau());
        if (dto.getDureeMinutes() != null) {
            test.setDureeMinutes(Integer.parseInt(dto.getDureeMinutes()));
        }

        TestTechnique saved = testTechniqueRepository.save(test);

        // Créer et associer les questions
        if (dto.getQuestions() != null) {
            for (QuestionDTO qDto : dto.getQuestions()) {
                Question question = questionMapper.toEntity(qDto);
                question.setTestTechnique(saved);
                saved.getQuestions().add(questionRepository.save(question));
            }
        }

        return toTestDTO(saved);
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
        dto.setNiveau(test.getNiveau());
        dto.setDureeMinutes(test.getDureeMinutes() != null ? test.getDureeMinutes().toString() : null);
        dto.setDateCreation(test.getDateCreation());
        List<QuestionDTO> questions = test.getQuestions().stream()
                .map(questionMapper::toDto)
                .collect(Collectors.toList());
        dto.setQuestions(questions);
        return dto;
    }
}
