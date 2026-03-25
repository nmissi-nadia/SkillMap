package com.skill.backend.service;

import com.skill.backend.dto.CompetenceDTO;
import com.skill.backend.entity.Competence;
import com.skill.backend.enums.TypeCompetence;
import com.skill.backend.mapper.CompetenceMapper;
import com.skill.backend.repository.CompetenceRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompetenceServiceTest {

    @Mock
    private CompetenceRepository competenceRepository;

    @Mock
    private CompetenceMapper competenceMapper;

    @InjectMocks
    private CompetenceService competenceService;

    private Competence competence;
    private CompetenceDTO competenceDTO;

    @BeforeEach
    void setUp() {
        competence = new Competence();
        competence.setId("comp-1");
        competence.setNom("Java");
        competence.setType(TypeCompetence.HARD);

        competenceDTO = new CompetenceDTO();
        competenceDTO.setId("comp-1");
        competenceDTO.setNom("Java");
        competenceDTO.setType(TypeCompetence.HARD);
    }

    @Test
    void getAllCompetencies_shouldReturnList() {
        when(competenceRepository.findAll()).thenReturn(List.of(competence));
        when(competenceMapper.toDto(any())).thenReturn(competenceDTO);

        List<CompetenceDTO> result = competenceService.getAllCompetencies();

        assertThat(result).hasSize(1);
        verify(competenceRepository).findAll();
    }

    @Test
    void getByType_shouldFilterResults() {
        Competence softComp = new Competence();
        softComp.setType(TypeCompetence.SOFT);
        
        when(competenceRepository.findAll()).thenReturn(List.of(competence, softComp));
        when(competenceMapper.toDto(competence)).thenReturn(competenceDTO);

        List<CompetenceDTO> result = competenceService.getByType(TypeCompetence.HARD);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(TypeCompetence.HARD);
    }

    @Test
    void getById_shouldReturnDto() {
        when(competenceRepository.findById("comp-1")).thenReturn(Optional.of(competence));
        when(competenceMapper.toDto(competence)).thenReturn(competenceDTO);

        CompetenceDTO result = competenceService.getById("comp-1");

        assertThat(result.getNom()).isEqualTo("Java");
    }

    @Test
    void getById_shouldThrowException_whenNotFound() {
        when(competenceRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> competenceService.getById("unknown"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Compétence non trouvée");
    }

    @Test
    void createCompetence_shouldSaveAndReturnDto() {
        when(competenceMapper.toEntity(any())).thenReturn(competence);
        when(competenceRepository.save(any())).thenReturn(competence);
        when(competenceMapper.toDto(any())).thenReturn(competenceDTO);

        CompetenceDTO result = competenceService.createCompetence(competenceDTO);

        assertThat(result.getId()).isEqualTo("comp-1");
        verify(competenceRepository).save(any());
    }

    @Test
    void updateCompetence_shouldUpdateAndSave() {
        when(competenceRepository.findById("comp-1")).thenReturn(Optional.of(competence));
        when(competenceRepository.save(any())).thenReturn(competence);
        when(competenceMapper.toDto(any())).thenReturn(competenceDTO);

        CompetenceDTO result = competenceService.updateCompetence("comp-1", competenceDTO);

        assertThat(result.getNom()).isEqualTo("Java");
        verify(competenceRepository).save(any());
    }

    @Test
    void updateCompetence_shouldThrowException_whenNotFound() {
        when(competenceRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> competenceService.updateCompetence("unknown", competenceDTO))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void deleteCompetence_shouldDelete_whenExists() {
        when(competenceRepository.existsById("comp-1")).thenReturn(true);

        competenceService.deleteCompetence("comp-1");

        verify(competenceRepository).deleteById("comp-1");
    }

    @Test
    void deleteCompetence_shouldThrowException_whenNotExists() {
        when(competenceRepository.existsById("unknown")).thenReturn(false);

        assertThatThrownBy(() -> competenceService.deleteCompetence("unknown"))
                .isInstanceOf(RuntimeException.class);
    }
}
