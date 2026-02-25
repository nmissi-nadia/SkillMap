package com.skill.backend.service;

import com.skill.backend.dto.*;
import com.skill.backend.entity.*;
import com.skill.backend.enums.RoleUtilisateur;
import com.skill.backend.enums.TypeCompetence;
import com.skill.backend.mapper.EmployeMapper;
import com.skill.backend.mapper.ManagerMapper;
import com.skill.backend.mapper.RHMapper;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RHService {

    private final RHRepository rhRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmployeRepository employeRepository;
    private final ManagerRepository managerRepository;
    private final CompetenceRepository competenceRepository;
    private final CompetenceEmployeRepository competenceEmployeRepository;
    private final FormationRepository formationRepository;
    private final FormationEmployeRepository formationEmployeRepository;
    private final RHMapper rhMapper;
    private final EmployeMapper employeMapper;
    private final ManagerMapper managerMapper;
    private final PasswordEncoder passwordEncoder;

    // ========== Helper: Récupérer RH par email ==========
    
    private RH getRHByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (utilisateur.getRole() != RoleUtilisateur.RH) {
            throw new RuntimeException("L'utilisateur n'est pas RH");
        }
        
        if (utilisateur instanceof RH) {
            return (RH) utilisateur;
        }
        
        return rhRepository.findById(utilisateur.getId())
                .orElseThrow(() -> new RuntimeException("RH non trouvé pour l'ID: " + utilisateur.getId()));
    }

    // ========== PHASE 1: GESTION DES UTILISATEURS ==========

    /**
     * Récupérer tous les utilisateurs avec filtres
     */
    public Page<UtilisateurDTO> getAllUtilisateurs(String rhEmail, RoleUtilisateur role, Pageable pageable) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Page<Utilisateur> utilisateurs;
        if (role != null) {
            utilisateurs = utilisateurRepository.findByRole(role, pageable);
        } else {
            utilisateurs = utilisateurRepository.findAll(pageable);
        }
        
        return utilisateurs.map(this::toUtilisateurDTO);
    }

    /**
     * Créer un nouvel utilisateur
     */
    @Transactional
    public UtilisateurDTO createUtilisateur(String rhEmail, CreateUtilisateurDTO dto) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        // Vérifier que l'email n'existe pas déjà
        if (utilisateurRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }
        
        Utilisateur utilisateur;
        
        switch (dto.getRole()) {
            case EMPLOYE:
                Employe employe = new Employe();
                employe.setPoste(dto.getPoste());
                employe.setDepartement(dto.getDepartement());
                employe.setDisponibilite(true);
                utilisateur = employe;
                break;
                
            case MANAGER:
                Manager manager = new Manager();
                manager.setDepartementResponsable(dto.getDepartement());
                utilisateur = manager;
                break;
                
            case RH:
                RH rh = new RH();
                rh.setService(dto.getService());
                utilisateur = rh;
                break;
                
            case CHEF_PROJET:
                ChefProjet chefProjet = new ChefProjet();
                chefProjet.setDomaine(dto.getDomaine());
                utilisateur = chefProjet;
                break;
                
            default:
                throw new RuntimeException("Rôle non supporté: " + dto.getRole());
        }
        
        // Propriétés communes
        utilisateur.setId(UUID.randomUUID().toString());
        utilisateur.setEmail(dto.getEmail());
        utilisateur.setNom(dto.getNom());
        utilisateur.setPrenom(dto.getPrenom());
        utilisateur.setRole(dto.getRole());
        utilisateur.setProvider(com.skill.backend.enums.Provider.LOCAL);
        utilisateur.setEnabled(true);
        utilisateur.setDateCreation(LocalDateTime.now());
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            utilisateur.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        
        utilisateur = utilisateurRepository.save(utilisateur);
        
        return toUtilisateurDTO(utilisateur);
    }

    /**
     * Mettre à jour un utilisateur
     */
    @Transactional
    public UtilisateurDTO updateUtilisateur(String rhEmail, String userId, UpdateUtilisateurDTO dto) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (dto.getNom() != null) utilisateur.setNom(dto.getNom());
        if (dto.getPrenom() != null) utilisateur.setPrenom(dto.getPrenom());
        if (dto.getEmail() != null) utilisateur.setEmail(dto.getEmail());
        
        // Mise à jour spécifique selon le type
        if (utilisateur instanceof Employe && dto.getPoste() != null) {
            ((Employe) utilisateur).setPoste(dto.getPoste());
        }
        if (utilisateur instanceof Employe && dto.getDepartement() != null) {
            ((Employe) utilisateur).setDepartement(dto.getDepartement());
        }
        if (utilisateur instanceof Manager && dto.getDepartement() != null) {
            ((Manager) utilisateur).setDepartementResponsable(dto.getDepartement());
        }
        
        utilisateur = utilisateurRepository.save(utilisateur);
        
        return toUtilisateurDTO(utilisateur);
    }

    /**
     * Désactiver un utilisateur
     */
    @Transactional
    public void deactivateUtilisateur(String rhEmail, String userId) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        utilisateur.setEnabled(false);
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Activer un utilisateur
     */
    @Transactional
    public void activateUtilisateur(String rhEmail, String userId) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        utilisateur.setEnabled(true);
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Assigner un manager à un employé
     */
    @Transactional
    public EmployeDTO assignManagerToEmployee(String rhEmail, String employeId, String managerId) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager non trouvé"));
        
        employe.setManager(manager);
        employe = employeRepository.save(employe);
        
        return employeMapper.toDto(employe);
    }

    /**
     * Récupérer la liste des départements
     */
    public List<String> getDepartments(String rhEmail) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        return employeRepository.findAll().stream()
                .map(Employe::getDepartement)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // ========== PHASE 2: CARTOGRAPHIE DES COMPÉTENCES ==========

    /**
     * Récupérer la cartographie complète des compétences de l'entreprise
     */
    public SkillsMapDTO getCompanySkillsMap(String rhEmail, String department, String poste, Integer niveau) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        List<CompetenceEmploye> allCompetences = competenceEmployeRepository.findAll();
        
        // Filtrer par département si spécifié
        if (department != null && !department.isEmpty()) {
            allCompetences = allCompetences.stream()
                    .filter(ce -> ce.getEmploye().getDepartement() != null && 
                                  ce.getEmploye().getDepartement().equalsIgnoreCase(department))
                    .collect(Collectors.toList());
        }
        
        // Filtrer par poste si spécifié
        if (poste != null && !poste.isEmpty()) {
            allCompetences = allCompetences.stream()
                    .filter(ce -> ce.getEmploye().getPoste() != null && 
                                  ce.getEmploye().getPoste().equalsIgnoreCase(poste))
                    .collect(Collectors.toList());
        }
        
        // Filtrer par niveau si spécifié
        if (niveau != null) {
            allCompetences = allCompetences.stream()
                    .filter(ce -> ce.getNiveauManager() >= niveau)
                    .collect(Collectors.toList());
        }
        
        return buildSkillsMap(allCompetences);
    }

    /**
     * Identifier les compétences rares (peu d'employés les possèdent)
     */
    public List<RareSkillDTO> getRareSkills(String rhEmail, int threshold) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Map<String, Long> skillCounts = competenceEmployeRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        ce -> ce.getCompetence().getId(),
                        Collectors.counting()
                ));
        
        return skillCounts.entrySet().stream()
                .filter(entry -> entry.getValue() <= threshold)
                .map(entry -> {
                    Competence competence = competenceRepository.findById(entry.getKey())
                            .orElse(null);
                    if (competence == null) return null;
                    
                    RareSkillDTO dto = new RareSkillDTO();
                    dto.setCompetenceId(competence.getId());
                    dto.setCompetenceNom(competence.getNom());
                    dto.setCategorie(competence.getType());
                    dto.setNombreEmployes(entry.getValue().intValue());
                    dto.setRarete(calculateRarity(entry.getValue().intValue()));
                    
                    return dto;
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(RareSkillDTO::getNombreEmployes))
                .collect(Collectors.toList());
    }

    /**
     * Identifier les compétences critiques (essentielles pour l'entreprise)
     */
    public List<CriticalSkillDTO> getCriticalSkills(String rhEmail) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        // Compétences critiques = compétences requises par beaucoup de projets
        // ou compétences avec niveau moyen faible
        
        List<CompetenceEmploye> allCompetences = competenceEmployeRepository.findAll();
        
        Map<String, List<CompetenceEmploye>> competenceGroups = allCompetences.stream()
                .collect(Collectors.groupingBy(ce -> ce.getCompetence().getId()));
        
        return competenceGroups.entrySet().stream()
                .map(entry -> {
                    Competence competence = competenceRepository.findById(entry.getKey())
                            .orElse(null);
                    if (competence == null) return null;
                    
                    List<CompetenceEmploye> ces = entry.getValue();
                    double avgLevel = ces.stream()
                            .mapToInt(CompetenceEmploye::getNiveauManager)
                            .average()
                            .orElse(0.0);
                    
                    CriticalSkillDTO dto = new CriticalSkillDTO();
                    dto.setCompetenceId(competence.getId());
                    dto.setCompetenceNom(competence.getNom());
                    dto.setCategorie(competence.getType());
                    dto.setNombreEmployes(ces.size());
                    dto.setNiveauMoyen(avgLevel);
                    dto.setCriticite(calculateCriticality(ces.size(), avgLevel));
                    
                    return dto;
                })
                .filter(Objects::nonNull)
                .filter(dto -> "HAUTE".equals(dto.getCriticite()) || "CRITIQUE".equals(dto.getCriticite()))
                .sorted(Comparator.comparing(CriticalSkillDTO::getCriticite).reversed())
                .collect(Collectors.toList());
    }

    // ========== Méthodes Helper ==========

    private UtilisateurDTO toUtilisateurDTO(Utilisateur utilisateur) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setEmail(utilisateur.getEmail());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setRole(utilisateur.getRole());
        dto.setEnabled(utilisateur.isEnabled());
        dto.setDateCreation(utilisateur.getDateCreation());
        dto.setProvider(utilisateur.getProvider());
        
        return dto;
    }

    private SkillsMapDTO buildSkillsMap(List<CompetenceEmploye> competences) {
        SkillsMapDTO map = new SkillsMapDTO();
        map.setTotalCompetences(competences.stream()
                .map(ce -> ce.getCompetence().getId())
                .distinct()
                .count());
        
        map.setTotalEmployes(competences.stream()
                .map(ce -> ce.getEmploye().getId())
                .distinct()
                .count());
        
        // Répartition par catégorie (type)
        Map<TypeCompetence, Long> byCategory = competences.stream()
                .collect(Collectors.groupingBy(
                        ce -> ce.getCompetence().getType(),
                        Collectors.counting()
                ));
        map.setRepartitionParCategorie(byCategory);
        
        // Niveau moyen global (utiliser niveauManager comme niveau actuel)
        double avgLevel = competences.stream()
                .mapToInt(CompetenceEmploye::getNiveauManager)
                .average()
                .orElse(0.0);
        map.setNiveauMoyenGlobal(avgLevel);
        
        return map;
    }

    private String calculateRarity(int count) {
        if (count == 1) return "UNIQUE";
        if (count <= 3) return "TRÈS_RARE";
        if (count <= 5) return "RARE";
        return "COMMUN";
    }

    private String calculateCriticality(int employeeCount, double avgLevel) {
        if (employeeCount <= 2 && avgLevel < 3.0) return "CRITIQUE";
        if (employeeCount <= 5 && avgLevel < 3.5) return "HAUTE";
        if (avgLevel < 3.0) return "MOYENNE";
        return "BASSE";
    }

    // ========== PHASE 3: GESTION DES FORMATIONS ==========

    /**
     * Créer une nouvelle formation
     */
    @Transactional
    public FormationDTO createFormation(String rhEmail, CreateFormationDTO dto) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Formation formation = new Formation();
        formation.setId(UUID.randomUUID().toString());
        formation.setTitre(dto.getTitre());
        formation.setOrganisme(dto.getOrganisme());
        formation.setType(dto.getType());
        formation.setStatut(dto.getStatut() != null ? dto.getStatut() : "Recommandée");
        formation.setDateDebut(dto.getDateDebut());
        formation.setDateFin(dto.getDateFin());
        formation.setCout(dto.getCout());
        formation.setCertification(dto.getCertification());
        
        formation = formationRepository.save(formation);
        
        return toFormationDTO(formation);
    }

    /**
     * Mettre à jour une formation
     */
    @Transactional
    public FormationDTO updateFormation(String rhEmail, String formationId, CreateFormationDTO dto) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        
        if (dto.getTitre() != null) formation.setTitre(dto.getTitre());
        if (dto.getOrganisme() != null) formation.setOrganisme(dto.getOrganisme());
        if (dto.getType() != null) formation.setType(dto.getType());
        if (dto.getStatut() != null) formation.setStatut(dto.getStatut());
        if (dto.getDateDebut() != null) formation.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) formation.setDateFin(dto.getDateFin());
        if (dto.getCout() != null) formation.setCout(dto.getCout());
        if (dto.getCertification() != null) formation.setCertification(dto.getCertification());
        
        formation = formationRepository.save(formation);
        
        return toFormationDTO(formation);
    }

    /**
     * Assigner une formation à plusieurs employés
     */
    @Transactional
    public List<String> assignFormation(String rhEmail, AssignFormationDTO dto) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Formation formation = formationRepository.findById(dto.getFormationId())
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        
        List<String> assignedIds = new ArrayList<>();
        
        for (String employeId : dto.getEmployeIds()) {
            Employe employe = employeRepository.findById(employeId)
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé: " + employeId));
            
            FormationEmploye fe = new FormationEmploye();
            fe.setId(UUID.randomUUID().toString());
            fe.setEmploye(employe);
            fe.setFormation(formation);
            fe.setStatut("ASSIGNEE");
            fe.setDateAssignation(LocalDateTime.now());
            fe.setProgression(0);
            fe.setValideeParRH(false);
            
            fe = formationEmployeRepository.save(fe);
            assignedIds.add(fe.getId());
        }
        
        return assignedIds;
    }

    /**
     * Récupérer le suivi budget d'une formation
     */
    public FormationBudgetDTO getFormationBudget(String rhEmail, String formationId) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        
        List<FormationEmploye> formationEmployes = formationEmployeRepository.findByFormationId(formationId);
        
        FormationBudgetDTO budget = new FormationBudgetDTO();
        budget.setFormationId(formation.getId());
        budget.setTitre(formation.getTitre());
        budget.setCoutTotal(formation.getCout());
        budget.setDateDebut(formation.getDateDebut());
        budget.setDateFin(formation.getDateFin());
        
        int totalAssignes = formationEmployes.size();
        long termines = formationEmployes.stream().filter(fe -> "TERMINEE".equals(fe.getStatut())).count();
        long enCours = formationEmployes.stream().filter(fe -> "EN_COURS".equals(fe.getStatut())).count();
        
        budget.setNombreEmployesAssignes(totalAssignes);
        budget.setNombreEmployesTermines((int) termines);
        budget.setNombreEmployesEnCours((int) enCours);
        
        if (totalAssignes > 0 && formation.getCout() != null) {
            budget.setCoutParEmploye(formation.getCout() / totalAssignes);
            budget.setTauxCompletion((termines * 100.0) / totalAssignes);
        } else {
            budget.setCoutParEmploye(0.0);
            budget.setTauxCompletion(0.0);
        }

        // Champs enrichis
        budget.setCoutUnitaire(formation.getCout()); // cout unitaire = cout de la formation
        budget.setNombreInscrits(totalAssignes);
        if (formation.getMaxParticipants() != null && formation.getCout() != null) {
            double budgetMax = formation.getMaxParticipants() * formation.getCout();
            double coutReel = formation.getCout() != null ? formation.getCout() : 0.0;
            budget.setBudgetRestant(budgetMax - coutReel * totalAssignes);
        }
        
        // ROI simplifié : basé sur le taux de complétion
        budget.setRoi(calculateFormationROI(formation, formationEmployes));
        
        // Statuts des employés
        List<EmployeFormationStatusDTO> statuts = formationEmployes.stream()
                .map(fe -> {
                    EmployeFormationStatusDTO status = new EmployeFormationStatusDTO();
                    status.setEmployeId(fe.getEmploye().getId());
                    status.setEmployeNom(fe.getEmploye().getNom());
                    status.setEmployePrenom(fe.getEmploye().getPrenom());
                    status.setStatut(fe.getStatut());
                    status.setProgression(fe.getProgression());
                    status.setCertification(fe.getCertification());
                    status.setValideeParRH(fe.getValideeParRH());
                    return status;
                })
                .collect(Collectors.toList());
        
        budget.setEmployesStatuts(statuts);
        
        return budget;
    }

    /**
     * Calculer le ROI d'une formation
     */
    public Double calculateFormationROI(String rhEmail, String formationId) {
        getRHByEmail(rhEmail); // Vérifier les droits
        
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        
        List<FormationEmploye> formationEmployes = formationEmployeRepository.findByFormationId(formationId);
        
        return calculateFormationROI(formation, formationEmployes);
    }

    /**
     * Valider ou rejeter une certification
     */
    @Transactional
    public void validateCertification(String rhEmail, CertificationValidationDTO dto) {
        RH rh = getRHByEmail(rhEmail); // Vérifier les droits
        
        List<FormationEmploye> formationEmployes = formationEmployeRepository.findByFormationId(dto.getFormationId());
        
        FormationEmploye fe = formationEmployes.stream()
                .filter(f -> f.getEmploye().getId().equals(dto.getEmployeId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Formation non trouvée pour cet employé"));
        
        if (dto.getValide()) {
            fe.setValideeParRH(true);
            fe.setCertification(dto.getCertification());
            fe.setUrlCertificat(dto.getUrlCertificat());
            fe.setStatut("TERMINEE");
            fe.setProgression(100);
            
            // Mettre à jour la formation principale
            Formation formation = fe.getFormation();
            formation.setDateValidation(LocalDateTime.now());
            formation.setValideePar(rh.getId());
            formationRepository.save(formation);
        } else {
            fe.setValideeParRH(false);
            // Optionnel: ajouter un commentaire de rejet
        }
        
        formationEmployeRepository.save(fe);
    }

    /**
     * Récupérer toutes les formations
     */
    public Page<FormationDTO> getAllFormations(String rhEmail, Pageable pageable) {
        getRHByEmail(rhEmail); // Vérifier les droits

        // Utiliser PageRequest sans sort pour éviter PropertyReferenceException (ex: sort=string depuis Swagger)
        org.springframework.data.domain.PageRequest safePageable =
            org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize()
            );

        Page<Formation> formations = formationRepository.findAll(safePageable);
        return formations.map(this::toFormationDTO);
    }

    // ========== Méthodes Helper Phase 3 ==========

    private FormationDTO toFormationDTO(Formation formation) {
        FormationDTO dto = new FormationDTO();
        dto.setId(formation.getId());
        dto.setTitre(formation.getTitre());
        dto.setOrganisme(formation.getOrganisme());
        dto.setType(formation.getType());
        dto.setStatut(formation.getStatut());
        dto.setDescription(formation.getDescription());
        dto.setDateDebut(formation.getDateDebut());
        dto.setDateFin(formation.getDateFin());
        dto.setCout(formation.getCout());
        dto.setDureeHeures(formation.getDureeHeures());
        dto.setMaxParticipants(formation.getMaxParticipants());
        dto.setNiveauRequis(formation.getNiveauRequis());
        dto.setCertification(formation.getCertification());

        if (formation.getEmployes() != null) {
            Set<String> ids = formation.getEmployes().stream()
                    .map(Employe::getId)
                    .collect(Collectors.toSet());
            dto.setEmployeIds(ids);
            dto.setNombreInscrits(ids.size());
        } else {
            dto.setNombreInscrits(0);
        }

        return dto;
    }

    private Double calculateFormationROI(Formation formation, List<FormationEmploye> formationEmployes) {
        if (formation.getCout() == null || formation.getCout() == 0) {
            return 0.0;
        }
        
        // ROI simplifié basé sur :
        // - Taux de complétion
        // - Nombre de certifications validées
        // - Progression moyenne
        
        long termines = formationEmployes.stream()
                .filter(fe -> "TERMINEE".equals(fe.getStatut()))
                .count();
        
        long certifies = formationEmployes.stream()
                .filter(fe -> fe.getValideeParRH() != null && fe.getValideeParRH())
                .count();
        
        double avgProgression = formationEmployes.stream()
                .mapToInt(fe -> fe.getProgression() != null ? fe.getProgression() : 0)
                .average()
                .orElse(0.0);
        
        int totalEmployes = formationEmployes.size();
        
        if (totalEmployes == 0) {
            return 0.0;
        }
        
        // Formule ROI : ((Bénéfices - Coûts) / Coûts) * 100
        // Bénéfices estimés = (taux complétion * 0.4 + taux certification * 0.4 + progression * 0.2) * coût
        double tauxCompletion = (double) termines / totalEmployes;
        double tauxCertification = (double) certifies / totalEmployes;
        double tauxProgression = avgProgression / 100.0;
        
        double benefices = (tauxCompletion * 0.4 + tauxCertification * 0.4 + tauxProgression * 0.2) * formation.getCout();
        
        return ((benefices - formation.getCout()) / formation.getCout()) * 100;
    }
}

