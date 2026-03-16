package com.skill.backend.service;

import com.skill.backend.dto.*;
import com.skill.backend.entity.*;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final CompetenceRepository competenceRepository;
    private final FormationCompetenceRepository formationCompetenceRepository;
    private final RessourceFormationRepository ressourceFormationRepository;
    private final InscriptionFormationRepository inscriptionFormationRepository;

    @Transactional
    public FormationDetailDTO createFormation(CreateFormationRequestDTO dto) {
        Formation formation = new Formation();
        formation.setId(UUID.randomUUID().toString());
        formation.setTitre(dto.getTitre());
        formation.setDescription(dto.getDescription());
        formation.setTypeFormation(dto.getTypeFormation());
        formation.setTechnologie(dto.getTechnologie());
        formation.setDateDebut(dto.getDateDebut());
        formation.setDateFin(dto.getDateFin());
        formation.setLieu(dto.getLieu());

        formation = formationRepository.save(formation);

        // Association Compétence s'il y a
        if (dto.getCompetenceId() != null) {
            Competence competence = competenceRepository.findById(dto.getCompetenceId())
                    .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));
            FormationCompetence fc = new FormationCompetence();
            fc.setFormation(formation);
            fc.setCompetence(competence);
            fc.setNiveauCible(dto.getNiveauCible() != null ? dto.getNiveauCible() : 1);
            formationCompetenceRepository.save(fc);
            formation.getFormationCompetences().add(fc);
        }

        // Création des ressources
        if (dto.getRessources() != null && !dto.getRessources().isEmpty()) {
            for (CreateRessourceDTO resDto : dto.getRessources()) {
                RessourceFormation res = new RessourceFormation();
                res.setFormation(formation);
                res.setTitre(resDto.getTitre());
                res.setUrl(resDto.getUrl());
                res.setTypeRessource(resDto.getTypeRessource());
                ressourceFormationRepository.save(res);
                formation.getRessources().add(res);
            }
        }

        return getFormationById(formation.getId());
    }

    @Transactional(readOnly = true)
    public List<FormationDetailDTO> getAllFormations() {
        return formationRepository.findAll().stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FormationDetailDTO getFormationById(String id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        return toDetailDTO(formation);
    }

    private FormationDetailDTO toDetailDTO(Formation formation) {
        FormationDetailDTO dto = new FormationDetailDTO();
        dto.setId(formation.getId());
        dto.setTitre(formation.getTitre());
        dto.setDescription(formation.getDescription());
        dto.setTypeFormation(formation.getTypeFormation());
        dto.setTechnologie(formation.getTechnologie());
        dto.setDateDebut(formation.getDateDebut());
        dto.setDateFin(formation.getDateFin());
        dto.setLieu(formation.getLieu());

        if (!formation.getFormationCompetences().isEmpty()) {
            FormationCompetence fc = formation.getFormationCompetences().iterator().next(); // On prend la première (ou modifier DTO pour array)
            dto.setCompetenceId(fc.getCompetence().getId());
            dto.setCompetenceNom(fc.getCompetence().getNom());
            dto.setNiveauCible(fc.getNiveauCible());
        }

        List<RessourceFormationDTO> ressources = formation.getRessources().stream().map(r -> {
            RessourceFormationDTO rDto = new RessourceFormationDTO();
            rDto.setId(r.getId());
            rDto.setTitre(r.getTitre());
            rDto.setUrl(r.getUrl());
            rDto.setTypeRessource(r.getTypeRessource());
            return rDto;
        }).collect(Collectors.toList());
        dto.setRessources(ressources);

        List<InscriptionDTO> inscriptions = formation.getInscriptions().stream().map(i -> {
            InscriptionDTO idx = new InscriptionDTO();
            idx.setId(i.getId());
            idx.setEmployeId(i.getEmploye().getId());
            idx.setEmployeNom(i.getEmploye().getNom());
            idx.setEmployePrenom(i.getEmploye().getPrenom());
            idx.setStatut(i.getStatut());
            idx.setProgress(i.getProgress());
            idx.setScore(i.getScore());
            idx.setDateInscription(i.getDateInscription());
            return idx;
        }).collect(Collectors.toList());
        dto.setInscriptions(inscriptions);

        return dto;
    }
}
