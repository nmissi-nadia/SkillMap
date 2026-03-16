package com.skill.backend.service;

import com.skill.backend.dto.CreateFormationRequestDTO;
import com.skill.backend.dto.FormationDetailDTO;
import com.skill.backend.entity.Formation;
import com.skill.backend.entity.RH;
import com.skill.backend.repository.FormationRepository;
import com.skill.backend.repository.RHRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FormationServiceTest {

    @Mock
    private FormationRepository formationRepository;
    
    @Mock
    private com.skill.backend.repository.CompetenceRepository competenceRepository;

    @Mock
    private com.skill.backend.repository.FormationCompetenceRepository formationCompetenceRepository;

    @Mock
    private com.skill.backend.repository.RessourceFormationRepository ressourceFormationRepository;

    @InjectMocks
    private FormationService formationService;

    @Test
    void testCreateFormation_Success() {
        // Arrange
        CreateFormationRequestDTO request = new CreateFormationRequestDTO();
        request.setTitre("Java Avancé");
        request.setDateDebut(LocalDate.now());

        Formation formationMock = new Formation();
        formationMock.setId("f1");
        formationMock.setTitre("Java Avancé");
        // Initialiser les listes pour éviter NullPointerException dans toDetailDTO
        formationMock.setFormationCompetences(new java.util.ArrayList<>());
        formationMock.setRessources(new java.util.ArrayList<>());
        formationMock.setInscriptions(new java.util.ArrayList<>());

        when(formationRepository.save(any(Formation.class))).thenAnswer(invocation -> {
            Formation f = invocation.getArgument(0);
            f.setId("f1");
            return f;
        });

        when(formationRepository.findById("f1")).thenReturn(Optional.of(formationMock));

        // Act
        FormationDetailDTO result = formationService.createFormation(request);

        // Assert
        assertNotNull(result);
        assertEquals("Java Avancé", result.getTitre());
        assertEquals("f1", result.getId());
    }
}
