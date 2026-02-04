package com.skill.backend.service;

import com.skill.backend.dto.CompetenceDTO;
import com.skill.backend.entity.Competence;
import com.skill.backend.enums.TypeCompetence;
import com.skill.backend.mapper.CompetenceMapper;
import com.skill.backend.repository.CompetenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion du référentiel des compétences.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CompetenceService {

    private final CompetenceRepository competenceRepository;
    private final CompetenceMapper competenceMapper;

    /**
     * Récupérer toutes les compétences.
     */
    @Transactional(readOnly = true)
    public List<CompetenceDTO> getAllCompetencies() {
        return competenceRepository.findAll().stream()
                .map(competenceMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les compétences par type (HARD/SOFT).
     */
    @Transactional(readOnly = true)
    public List<CompetenceDTO> getByType(TypeCompetence type) {
        // Note: Si le repository n'a pas de méthode findByType, on peut filtrer en Java
        // ou ajouter la méthode au repository plus tard. Pour l'instant on filtre.
        return competenceRepository.findAll().stream()
                .filter(c -> c.getType() == type)
                .map(competenceMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer une compétence par son ID.
     */
    @Transactional(readOnly = true)
    public CompetenceDTO getById(String id) {
        return competenceRepository.findById(id)
                .map(competenceMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée avec l'ID: " + id));
    }

    /**
     * Créer une nouvelle compétence.
     */
    public CompetenceDTO createCompetence(CompetenceDTO dto) {
        Competence competence = competenceMapper.toEntity(dto);
        // L'ID est généré par @PrePersist dans l'entité si nul
        Competence saved = competenceRepository.save(competence);
        return competenceMapper.toDto(saved);
    }

    /**
     * Mettre à jour une compétence existante.
     */
    public CompetenceDTO updateCompetence(String id, CompetenceDTO dto) {
        Competence existing = competenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée avec l'ID: " + id));
        
        existing.setNom(dto.getNom());
        existing.setType(dto.getType());
        existing.setDescription(dto.getDescription());
        
        Competence updated = competenceRepository.save(existing);
        return competenceMapper.toDto(updated);
    }

    /**
     * Supprimer une compétence.
     */
    public void deleteCompetence(String id) {
        if (!competenceRepository.existsById(id)) {
            throw new RuntimeException("Compétence non trouvée avec l'ID: " + id);
        }
        competenceRepository.deleteById(id);
    }
}
