package com.skill.backend.service;

import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.TestEmploye;
import com.skill.backend.entity.TestTechnique;
import com.skill.backend.exception.BadRequestException;
import com.skill.backend.exception.ResourceNotFoundException;
import com.skill.backend.mapper.TestEmployeMapper;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.TestEmployeRepository;
import com.skill.backend.repository.TestTechniqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestAssignmentService {

    private final TestTechniqueRepository testTechniqueRepository;
    private final TestEmployeRepository testEmployeRepository;
    private final EmployeRepository employeRepository;
    private final TestEmployeMapper testEmployeMapper;

    /**
     * Affecter un test à un employé. Crée un TestEmploye avec statut ASSIGNED.
     */
    @Transactional
    public TestEmployeDTO assignTest(String testId, String employeId) {
        TestTechnique test = testTechniqueRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("TestTechnique", "id", testId));

        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employe", "id", employeId));

        // Vérifier si le test n'est pas déjà affecté
        testEmployeRepository.findByTestTechniqueIdAndEmployeId(testId, employeId).ifPresent(existing -> {
            if (!"COMPLETED".equals(existing.getStatut())) {
                throw new BadRequestException("Ce test est déjà affecté à cet employé et n'est pas encore terminé");
            }
        });

        TestEmploye testEmploye = new TestEmploye();
        testEmploye.setTestTechnique(test);
        testEmploye.setEmploye(employe);
        testEmploye.setStatut("ASSIGNED");
        testEmploye.setScore(0.0);

        TestEmploye saved = testEmployeRepository.save(testEmploye);
        return testEmployeMapper.toDto(saved);
    }

    /**
     * Récupérer tous les tests affectés à un employé.
     */
    @Transactional(readOnly = true)
    public List<TestEmployeDTO> getTestsForEmployee(String employeId) {
        // Vérifie que l'employé existe
        if (!employeRepository.existsById(employeId)) {
            throw new ResourceNotFoundException("Employe", "id", employeId);
        }
        return testEmployeRepository.findByEmployeId(employeId).stream()
                .map(testEmployeMapper::toDto)
                .collect(Collectors.toList());
    }
}
