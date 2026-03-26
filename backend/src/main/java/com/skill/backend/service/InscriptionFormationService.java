package com.skill.backend.service;

import com.skill.backend.dto.FormationDetailDTO;
import com.skill.backend.dto.InscriptionDTO;
import com.skill.backend.dto.RessourceFormationDTO;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Formation;
import com.skill.backend.entity.FormationCompetence;
import com.skill.backend.entity.InscriptionFormation;
import com.skill.backend.enums.InscriptionStatut;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.FormationRepository;
import com.skill.backend.repository.InscriptionFormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InscriptionFormationService {

    private final InscriptionFormationRepository inscriptionRepository;
    private final FormationRepository formationRepository;
    private final EmployeRepository employeRepository;
    private final NotificationService notificationService;

    @Transactional
    public InscriptionDTO assignFormationToEmployee(String formationId, String employeeId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        Employe employe = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        if (inscriptionRepository.findByEmployeIdAndFormationId(employeeId, formationId).isPresent()) {
            throw new RuntimeException("Employé déjà inscrit à cette formation");
        }

        InscriptionFormation inscription = new InscriptionFormation();
        inscription.setFormation(formation);
        inscription.setEmploye(employe);
        inscription.setStatut(InscriptionStatut.INSCRIT);
        inscription.setDateInscription(LocalDateTime.now());
        inscription.setProgress(0);

        inscription = inscriptionRepository.save(inscription);

        // Envoyer une notification à l'employé
        notificationService.notifyFormationAssignment(
            employe.getId(),
            formation.getTitre(),
            "RH", // Inscription souvent faite par RH ou système
            "Département RH"
        );

        return toInscriptionDTO(inscription);
    }

    public List<FormationDetailDTO> getEmployeeFormations(String employeeId) {
        System.out.println("🎓 [InscriptionFormationService] getEmployeeFormations called for: " + employeeId);
        try {
            List<InscriptionFormation> inscriptions = inscriptionRepository.findByEmployeId(employeeId);
            System.out.println("✅ [InscriptionFormationService] Found " + inscriptions.size() + " registrations");
            
            return inscriptions.stream()
                    .map(this::toFormationDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("❌ [InscriptionFormationService] Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public InscriptionDTO updateProgress(String formationId, String employeeId, Integer progress, Integer score) {
        InscriptionFormation inscription = inscriptionRepository.findByEmployeIdAndFormationId(employeeId, formationId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (progress != null) {
            inscription.setProgress(progress);
        }
        if (score != null) {
            inscription.setScore(score);
        }

        if (inscription.getProgress() >= 100) {
            inscription.setStatut(InscriptionStatut.TERMINE);
            inscription.setProgress(100);
        } else if (inscription.getProgress() > 0) {
            inscription.setStatut(InscriptionStatut.EN_COURS);
        }

        inscription = inscriptionRepository.save(inscription);
        return toInscriptionDTO(inscription);
    }

    private InscriptionDTO toInscriptionDTO(InscriptionFormation inscription) {
        InscriptionDTO dto = new InscriptionDTO();
        dto.setId(inscription.getId());
        dto.setEmployeId(inscription.getEmploye().getId());
        dto.setEmployeNom(inscription.getEmploye().getNom());
        dto.setEmployePrenom(inscription.getEmploye().getPrenom());
        dto.setStatut(inscription.getStatut());
        dto.setProgress(inscription.getProgress());
        dto.setScore(inscription.getScore());
        dto.setDateInscription(inscription.getDateInscription());
        return dto;
    }

    private FormationDetailDTO toFormationDTO(InscriptionFormation inscription) {
        Formation formation = inscription.getFormation();
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
            FormationCompetence fc = formation.getFormationCompetences().iterator().next();
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

        // N'inclure que l'inscription de l'employé en question
        dto.setInscriptions(List.of(toInscriptionDTO(inscription)));

        return dto;
    }
}
