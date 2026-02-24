package com.skill.backend.service;

import com.skill.backend.dto.AffectationProjetDTO;
import com.skill.backend.dto.ProjetDTO;
import com.skill.backend.entity.AffectationProjet;
import com.skill.backend.entity.ChefProjet;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Projet;
import com.skill.backend.repository.AffectationProjetRepository;
import com.skill.backend.repository.ChefProjetRepository;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.ProjetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjetService {

    private final ProjetRepository projetRepository;
    private final ChefProjetRepository chefProjetRepository;
    private final AffectationProjetRepository affectationRepository;
    private final EmployeRepository employeRepository;

    // ========================================================
    // Récupérer le chef de projet connecté
    // ========================================================
    private ChefProjet getChefProjetConnecte() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return chefProjetRepository.findAll().stream()
                .filter(c -> c.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Chef de projet non trouvé: " + email));
    }

    // ========================================================
    // PROJETS
    // ========================================================

    public List<ProjetDTO> getMesProjets() {
        ChefProjet chef = getChefProjetConnecte();
        return projetRepository.findByChefProjetId(chef.getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjetDTO> getAllProjets() {
        return projetRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProjetDTO getProjetById(String id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + id));
        return toDTO(projet);
    }

    @Transactional
    public ProjetDTO createProjet(ProjetDTO dto) {
        ChefProjet chef = getChefProjetConnecte();
        Projet projet = new Projet();
        mapDTOToEntity(dto, projet);
        projet.setChefProjet(chef);
        if (projet.getStatut() == null) projet.setStatut("PLANIFIE");
        if (projet.getProgression() == null) projet.setProgression(0);
        return toDTO(projetRepository.save(projet));
    }

    @Transactional
    public ProjetDTO updateProjet(String id, ProjetDTO dto) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + id));
        mapDTOToEntity(dto, projet);
        return toDTO(projetRepository.save(projet));
    }

    @Transactional
    public void deleteProjet(String id) {
        projetRepository.deleteById(id);
    }

    // ========================================================
    // AFFECTATIONS (équipe)
    // ========================================================

    public List<AffectationProjetDTO> getEquipeProjet(String projetId) {
        return affectationRepository.findByProjetId(projetId)
                .stream()
                .map(this::toAffectationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AffectationProjetDTO affecterMembre(String projetId, AffectationProjetDTO dto) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + projetId));

        Employe employe = employeRepository.findById(dto.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé: " + dto.getEmployeId()));

        AffectationProjet affectation = new AffectationProjet();
        affectation.setProjet(projet);
        affectation.setEmploye(employe);
        affectation.setRoleDansProjet(dto.getRoleDansProjet());
        affectation.setDateAffectation(LocalDate.now());
        affectation.setStatut("ACTIVE");

        // Champs optionnels
        if (dto.getTauxAllocation() != null) affectation.setTauxAllocation(dto.getTauxAllocation());
        if (dto.getDateDebut() != null) affectation.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) affectation.setDateFin(dto.getDateFin());

        String chefId = getChefProjetConnecte().getId();
        affectation.setAssignePar(chefId);

        return toAffectationDTO(affectationRepository.save(affectation));
    }

    @Transactional
    public void retirerMembre(String projetId, String employeId) {
        affectationRepository.findByProjetId(projetId).stream()
                .filter(a -> a.getEmploye().getId().equals(employeId) && "ACTIVE".equals(a.getStatut()))
                .forEach(a -> {
                    a.setStatut("TERMINEE");
                    affectationRepository.save(a);
                });
    }

    // ========================================================
    // Mapping helpers
    // ========================================================

    private ProjetDTO toDTO(Projet p) {
        ProjetDTO dto = new ProjetDTO();
        dto.setId(p.getId());
        dto.setNom(p.getNom());
        dto.setDescription(p.getDescription());
        dto.setDateDebut(p.getDateDebut());
        dto.setDateFin(p.getDateFin());
        dto.setStatut(p.getStatut());
        dto.setClient(p.getClient());
        dto.setBudget(p.getBudget());
        dto.setPriorite(p.getPriorite());
        dto.setChargeEstimee(p.getChargeEstimee());
        dto.setProgression(p.getProgression());
        if (p.getChefProjet() != null) {
            dto.setChefProjetId(p.getChefProjet().getId());
            dto.setChefProjetNom(p.getChefProjet().getPrenom() + " " + p.getChefProjet().getNom());
        }
        // Nombre de membres actifs
        long nbMembres = affectationRepository.findByProjetId(p.getId()).stream()
                .filter(a -> "ACTIVE".equals(a.getStatut()))
                .count();
        dto.setNombreMembres((int) nbMembres);
        return dto;
    }

    private void mapDTOToEntity(ProjetDTO dto, Projet projet) {
        if (dto.getNom() != null) projet.setNom(dto.getNom());
        if (dto.getDescription() != null) projet.setDescription(dto.getDescription());
        if (dto.getDateDebut() != null) projet.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) projet.setDateFin(dto.getDateFin());
        if (dto.getStatut() != null) projet.setStatut(dto.getStatut());
        if (dto.getClient() != null) projet.setClient(dto.getClient());
        if (dto.getBudget() != null) projet.setBudget(dto.getBudget());
        if (dto.getPriorite() != null) projet.setPriorite(dto.getPriorite());
        if (dto.getChargeEstimee() != null) projet.setChargeEstimee(dto.getChargeEstimee());
        if (dto.getProgression() != null) projet.setProgression(dto.getProgression());
    }

    private AffectationProjetDTO toAffectationDTO(AffectationProjet a) {
        AffectationProjetDTO dto = new AffectationProjetDTO();
        dto.setId(a.getId());
        dto.setRoleDansProjet(a.getRoleDansProjet());
        dto.setDateAffectation(a.getDateAffectation());
        dto.setStatut(a.getStatut());
        dto.setTauxAllocation(a.getTauxAllocation());
        dto.setDateDebut(a.getDateDebut());
        dto.setDateFin(a.getDateFin());
        if (a.getEmploye() != null) {
            dto.setEmployeId(a.getEmploye().getId());
            dto.setEmployeNom(a.getEmploye().getPrenom() + " " + a.getEmploye().getNom());
        }
        if (a.getProjet() != null) {
            dto.setProjetId(a.getProjet().getId());
        }
        return dto;
    }
}
