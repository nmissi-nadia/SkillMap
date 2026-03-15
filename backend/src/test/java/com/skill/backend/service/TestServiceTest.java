package com.skill.backend.service;

import com.skill.backend.dto.TestDTO;
import com.skill.backend.entity.Question;
import com.skill.backend.entity.TestTechnique;
import com.skill.backend.exception.ResourceNotFoundException;
import com.skill.backend.mapper.QuestionMapper;
import com.skill.backend.repository.QuestionRepository;
import com.skill.backend.repository.TestTechniqueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestServiceTest {

    @Mock
    private TestTechniqueRepository testTechniqueRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private QuestionMapper questionMapper;

    @InjectMocks
    private TestService testService;

    private TestTechnique sampleTest;

    @BeforeEach
    void setUp() {
        sampleTest = new TestTechnique();
        sampleTest.setId("test-001");
        sampleTest.setTitre("Test Java Spring");
        sampleTest.setDescription("Test de compétences Spring Boot");
        sampleTest.setCompetenceId("comp-001");
        sampleTest.setNiveau("INTERMEDIAIRE");
        sampleTest.setDureeMinutes(60);
        sampleTest.setQuestions(new ArrayList<>());
    }

    // ─────────── Création d'un test ───────────

    @Test
    void createTest_shouldSaveTestAndReturnDTO() {
        // Arrange
        com.skill.backend.dto.QuestionDTO qDto = new com.skill.backend.dto.QuestionDTO();
        qDto.setContenu("Qu'est-ce que Spring Boot ?");
        qDto.setTypeQuestion("QCM");
        qDto.setBonneReponse("Un framework Java");
        qDto.setPoints(10);

        TestDTO inputDTO = new TestDTO();
        inputDTO.setTitre("Test Java Spring");
        inputDTO.setDescription("Test de compétences Spring Boot");
        inputDTO.setCompetenceId("comp-001");
        inputDTO.setNiveau("INTERMEDIAIRE");
        inputDTO.setDureeMinutes(60);
        inputDTO.setQuestions(List.of(qDto));

        Question questionEntity = new Question();
        questionEntity.setId("q-001");
        questionEntity.setContenu(qDto.getContenu());
        questionEntity.setPoints(10);

        when(testTechniqueRepository.save(any(TestTechnique.class))).thenReturn(sampleTest);
        when(questionMapper.toEntity(qDto)).thenReturn(questionEntity);
        when(questionRepository.save(any(Question.class))).thenReturn(questionEntity);
        when(questionMapper.toDto(any(Question.class))).thenReturn(qDto);

        // Act
        TestDTO result = testService.createTest(inputDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("test-001");
        assertThat(result.getTitre()).isEqualTo("Test Java Spring");
        verify(testTechniqueRepository, times(1)).save(any(TestTechnique.class));
    }

    // ─────────── Récupération d'un test par ID ───────────

    @Test
    void getTestById_shouldReturnDTO_whenTestExists() {
        when(testTechniqueRepository.findById("test-001")).thenReturn(Optional.of(sampleTest));

        TestDTO result = testService.getTestById("test-001");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("test-001");
        assertThat(result.getTitre()).isEqualTo("Test Java Spring");
    }

    @Test
    void getTestById_shouldThrowResourceNotFoundException_whenNotFound() {
        when(testTechniqueRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> testService.getTestById("unknown"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("TestTechnique");
    }

    // ─────────── Liste de tous les tests ───────────

    @Test
    void getAllTests_shouldReturnListOfDTOs() {
        when(testTechniqueRepository.findAll()).thenReturn(List.of(sampleTest));

        List<TestDTO> results = testService.getAllTests();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitre()).isEqualTo("Test Java Spring");
    }

    @Test
    void getAllTests_shouldReturnEmptyList_whenNoTestsExist() {
        when(testTechniqueRepository.findAll()).thenReturn(List.of());

        List<TestDTO> results = testService.getAllTests();

        assertThat(results).isEmpty();
    }
}
