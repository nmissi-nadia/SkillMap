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
    private final RHMapper rhMapper;
    private final EmployeMapper employeMapper;
    private final ManagerMapper managerMapper;
    private final PasswordEncoder passwordEncoder;

    // ========== Helper: Récupérer RH par email ==========
    
    private RH getRHByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (utilisateur.getRole() != RoleUtilisateur.RH && utilisateur.getRole() != RoleUtilisateur.ADMIN) {
            throw new RuntimeException("L'utilisateur n'est pas RH ou ADMIN");
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
}
