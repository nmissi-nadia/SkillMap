package com.skill.backend.service;

import com.skill.backend.dto.AssignTestDTO;
import com.skill.backend.dto.TestTechniqueDTO;
import com.skill.backend.entity.TestTechnique;
import com.skill.backend.repository.TestTechniqueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TestTechniqueServiceTest {

    @Mock
    private TestTechniqueRepository testTechniqueRepository;

    @InjectMocks
    private TestTechniqueService testTechniqueService;

    private TestTechnique testTechnique;

    @BeforeEach
    void setUp() {
        testTechnique = new TestTechnique();
        testTechnique.setId("test-1");
        testTechnique.setTitre("Java Test");
        testTechnique.setCompetenceId("comp-1");
        testTechnique.setTechnologie("Java");
    }

    @Test
    void getAllTests_shouldReturnList() {
        when(testTechniqueRepository.findAll()).thenReturn(List.of(testTechnique));
        List<TestTechniqueDTO> result = testTechniqueService.getAllTests();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("test-1");
    }

    @Test
    void getTestById_shouldReturnDto() {
        when(testTechniqueRepository.findById("test-1")).thenReturn(Optional.of(testTechnique));
        TestTechniqueDTO result = testTechniqueService.getTestById("test-1");
        assertThat(result.getTitre()).isEqualTo("Java Test");
    }

    @Test
    void getTestById_shouldThrowException_whenNotFound() {
        when(testTechniqueRepository.findById("unknown")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> testTechniqueService.getTestById("unknown"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void assignTest_shouldReturnLegacyDto() {
        AssignTestDTO request = new AssignTestDTO();
        TestTechniqueDTO result = testTechniqueService.assignTest(request, "admin");
        assertThat(result.getStatut()).contains("LEGACY_ASSIGN");
    }

    @Test
    void getActiveTests_shouldReturnAllTests() {
        when(testTechniqueRepository.findAll()).thenReturn(List.of(testTechnique));
        List<TestTechniqueDTO> result = testTechniqueService.getActiveTests("emp-1");
        assertThat(result).hasSize(1);
    }

    @Test
    void getTestsAssignedBy_shouldReturnAllTests() {
        when(testTechniqueRepository.findAll()).thenReturn(List.of(testTechnique));
        List<TestTechniqueDTO> result = testTechniqueService.getTestsAssignedBy("mgr-1");
        assertThat(result).hasSize(1);
    }
}
