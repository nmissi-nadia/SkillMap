package com.skill.backend.service;

import com.skill.backend.dto.AssignTestDTO;
import com.skill.backend.dto.TestTechniqueDTO;
import com.skill.backend.entity.TestTechnique;
import com.skill.backend.repository.TestTechniqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service legacy pour le workflow simplifié (compatibilité avec l'ancien contrôleur).
 * Les nouvelles fonctionnalités utilisent TestService, TestAssignmentService,
 * TestExecutionService et EvaluationService.
 */
@Service
@RequiredArgsConstructor
public class TestTechniqueService {

    private final TestTechniqueRepository testTechniqueRepository;

    /**
     * Récupérer tous les tests (lecture seule).
     */
    @Transactional(readOnly = true)
    public List<TestTechniqueDTO> getAllTests() {
        return testTechniqueRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer un test par ID.
     */
    @Transactional(readOnly = true)
    public TestTechniqueDTO getTestById(String id) {
        TestTechnique test = testTechniqueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test non trouvé : " + id));
        return toDTO(test);
    }

    /**
     * Assigner un test (legacy — déléguer vers TestAssignmentService dans les nouveaux cas).
     * Gardé pour compatibilité avec les anciens appels.
     */
    @Transactional
    public TestTechniqueDTO assignTest(AssignTestDTO request, String assignedBy) {
        // legacy: retourne un DTO vide pour ne pas casser le contrat
        TestTechniqueDTO dto = new TestTechniqueDTO();
        dto.setStatut("LEGACY_ASSIGN - utiliser le nouveau endpoint POST /api/tests/{testId}/assign/{employeId}");
        return dto;
    }

    /**
     * Récupérer les tests selon le statut legacy (compatibility shim).
     */
    @Transactional(readOnly = true)
    public List<TestTechniqueDTO> getActiveTests(String employeId) {
        // Redirige vers la liste de tous les tests pour compatibilité
        return getAllTests();
    }

    /**
     * Récupérer les tests assignés par un manager/RH (compatibility shim).
     */
    @Transactional(readOnly = true)
    public List<TestTechniqueDTO> getTestsAssignedBy(String assignePar) {
        return getAllTests();
    }

    // ---- Mapping helper ----

    private TestTechniqueDTO toDTO(TestTechnique test) {
        TestTechniqueDTO dto = new TestTechniqueDTO();
        dto.setId(test.getId());
        dto.setTitre(test.getTitre());
        dto.setCompetenceId(test.getCompetenceId());
        dto.setTechnologie(test.getTechnologie());
        dto.setNiveauCompetence(null);
        return dto;
    }
}
