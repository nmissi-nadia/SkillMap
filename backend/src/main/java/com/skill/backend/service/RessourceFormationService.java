package com.skill.backend.service;

import com.skill.backend.dto.CreateRessourceDTO;
import com.skill.backend.dto.RessourceFormationDTO;
import com.skill.backend.entity.Formation;
import com.skill.backend.entity.RessourceFormation;
import com.skill.backend.repository.FormationRepository;
import com.skill.backend.repository.RessourceFormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RessourceFormationService {

    private final RessourceFormationRepository ressourceRepository;
    private final FormationRepository formationRepository;

    @Transactional
    public RessourceFormationDTO addResourceToFormation(String formationId, CreateRessourceDTO dto) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        RessourceFormation res = new RessourceFormation();
        res.setFormation(formation);
        res.setTitre(dto.getTitre());
        res.setUrl(dto.getUrl());
        res.setTypeRessource(dto.getTypeRessource());

        res = ressourceRepository.save(res);
        return toRessourceDTO(res);
    }

    public List<RessourceFormationDTO> getResourcesByFormation(String formationId) {
        return ressourceRepository.findByFormationId(formationId).stream()
                .map(this::toRessourceDTO)
                .collect(Collectors.toList());
    }

    private RessourceFormationDTO toRessourceDTO(RessourceFormation res) {
        RessourceFormationDTO dto = new RessourceFormationDTO();
        dto.setId(res.getId());
        dto.setTitre(res.getTitre());
        dto.setUrl(res.getUrl());
        dto.setTypeRessource(res.getTypeRessource());
        return dto;
    }
}
