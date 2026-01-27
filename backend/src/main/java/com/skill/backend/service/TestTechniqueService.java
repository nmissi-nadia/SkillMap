package com.skill.backend.service;

import com.skill.backend.dto.AssignTestDTO;
import com.skill.backend.dto.SubmitTestDTO;
import com.skill.backend.dto.TestTechniqueDTO;
import com.skill.backend.entity.Competence;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.TestTechnique;
import com.skill.backend.repository.CompetenceEmployeRepository;
import com.skill.backend.repository.CompetenceRepository;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.TestTechniqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestTechniqueService {

    private final TestTechniqueRepository testTechniqueRepository;
    private final EmployeRepository employeRepository;
    private final CompetenceRepository competenceRepository;
    private final CompetenceEmployeRepository competenceEmployeRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Assigner un test technique à un employé (nouveau workflow)
     */
    @PreAuthorize("hasAnyRole('RH', 'MANAGER')")
    @Transactional
    public TestTechniqueDTO assignTest(AssignTestDTO request, String assignedBy) {
        Employe employe = employeRepository.findById(request.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        Competence competence = competenceRepository.findById(request.getCompetenceId())
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));

        TestTechnique test = new TestTechnique();
        test.setTitre("Test " + competence.getNom());
        test.setTechnologie(competence.getNom());
        test.setEmploye(employe);
        test.setCompetence(competence);
        test.setScore(0.0);
        test.setResultat("EN_ATTENTE");
        test.setStatut("ASSIGNE");
        test.setDateAssignation(LocalDateTime.now());
        test.setDateLimite(request.getDateLimite());
        test.setAssignePar(assignedBy);
        
        TestTechnique saved = testTechniqueRepository.save(test);

        // Audit log
        auditLogService.logAction(assignedBy, "ASSIGN_TEST", "TEST_TECHNIQUE", 
            saved.getId(), "Test assigné à " + employe.getNom() + " pour " + competence.getNom());

        // Notification employé
        notificationService.sendNotification(
            employe.getId(),
            "Nouveau test technique",
            String.format("Un test '%s' vous a été assigné. Date limite: %s", 
                competence.getNom(), request.getDateLimite())
        );

        return toDTO(saved);
    }

    /**
     * Soumettre les réponses d'un test
     */
    @PreAuthorize("hasRole('EMPLOYE')")
    @Transactional
    public TestTechniqueDTO submitTest(String testId, SubmitTestDTO answers, String employeId) {
        TestTechnique test = testTechniqueRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test non trouvé"));
        
        // Vérifier que le test appartient à l'employé
        if (!test.getEmploye().getId().equals(employeId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à soumettre ce test");
        }
        
        // Vérifier que le test n'est pas déjà terminé
        if ("TERMINE".equals(test.getStatut())) {
            throw new RuntimeException("Ce test a déjà été soumis");
        }

        // Calculer le score
        Double score = calculateScore(testId, answers);
        test.setScore(score);
        test.setResultat(score >= 70 ? "Réussi" : "Échoué");
        test.setStatut("TERMINE");
        test.setDatePassage(LocalDateTime.now());
        
        // Calculer et mettre à jour le niveau de compétence
        int niveauCompetence = calculateCompetenceLevel(score);
        test.setNiveauCompetence(niveauCompetence);
        
        TestTechnique saved = testTechniqueRepository.save(test);
        
        // Mettre à jour la compétence de l'employé
        updateCompetenceLevel(employeId, test.getCompetence().getId(), niveauCompetence);
        
        // Audit log
        auditLogService.logAction(employeId, "SUBMIT_TEST", "TEST_TECHNIQUE",
            testId, String.format("Score: %.2f%%, Niveau: %d", score, niveauCompetence));
        
        // Notification employé
        notificationService.sendNotification(
            employeId,
            "Résultat de test",
            String.format("Test '%s' terminé - Score: %.2f%% (%s)", 
                test.getTitre(), score, test.getResultat())
        );
        
        // Notification manager si réussi
        if (test.getEmploye().getManager() != null && score >= 70) {
            notificationService.sendNotification(
                test.getEmploye().getManager().getId(),
                "Test réussi",
                String.format("%s a réussi le test '%s' avec %.2f%%",
                    test.getEmploye().getNom(), test.getTitre(), score)
            );
        }
        
        return toDTO(saved);
    }

    /**
     * Calculer le score d'un test
     */
    public Double calculateScore(String testId, SubmitTestDTO answers) {
        // Logique simplifiée - dans la réalité, comparer avec les bonnes réponses
        if (answers.getAnswers() == null || answers.getAnswers().isEmpty()) {
            return 0.0;
        }
        
        // Exemple: score basé sur le nombre de réponses (à adapter selon votre logique)
        int totalQuestions = answers.getAnswers().size();
        int correctAnswers = (int) (totalQuestions * 0.75); // Simulation
        
        return (correctAnswers * 100.0) / totalQuestions;
    }

    /**
     * Mettre à jour le niveau de compétence de l'employé
     */
    private void updateCompetenceLevel(String employeId, String competenceId, int level) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        Competence competence = competenceRepository.findById(competenceId)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));
        
        // Chercher ou créer CompetenceEmploye
        List<CompetenceEmploye> existing = competenceEmployeRepository.findByEmploye(employe);
        CompetenceEmploye ce = existing.stream()
                .filter(c -> c.getCompetence().getId().equals(competenceId))
                .findFirst()
                .orElse(new CompetenceEmploye());
        
        if (ce.getId() == null) {
            ce.setEmploye(employe);
            ce.setCompetence(competence);
        }
        
        ce.setNiveauAuto(level);
        ce.setDateEvaluation(LocalDateTime.now().toLocalDate());
        ce.setCommentaire("Niveau mis à jour suite à test technique");
        
        competenceEmployeRepository.save(ce);
    }

    /**
     * Calculer le niveau de compétence basé sur le score
     */
    private int calculateCompetenceLevel(double score) {
        if (score >= 90) return 5;
        if (score >= 75) return 4;
        if (score >= 60) return 3;
        if (score >= 45) return 2;
        return 1;
    }

    /**
     * Récupérer les tests actifs pour un employé
     */
    public List<TestTechniqueDTO> getActiveTests(String employeId) {
        return testTechniqueRepository.findByEmployeIdAndStatut(employeId, "ASSIGNE").stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convertir TestTechnique en DTO
     */
    private TestTechniqueDTO toDTO(TestTechnique test) {
        TestTechniqueDTO dto = new TestTechniqueDTO();
        dto.setId(test.getId());
        dto.setTitre(test.getTitre());
        dto.setTechnologie(test.getTechnologie());
        dto.setScore(test.getScore());
        dto.setResultat(test.getResultat());
        dto.setStatut(test.getStatut());
        dto.setNiveauCompetence(test.getNiveauCompetence());
        
        if (test.getEmploye() != null) {
            dto.setEmployeId(test.getEmploye().getId());
            dto.setEmployeNom(test.getEmploye().getNom() + " " + test.getEmploye().getPrenom());
        }
        
        if (test.getCompetence() != null) {
            dto.setCompetenceId(test.getCompetence().getId());
            dto.setCompetenceNom(test.getCompetence().getNom());
        }
        
        if (test.getDateAssignation() != null) {
            dto.setDateAssignation(test.getDateAssignation().toString());
        }
        
        if (test.getDateLimite() != null) {
            dto.setDateLimite(test.getDateLimite().toString());
        }
        
        if (test.getDatePassage() != null) {
            dto.setDatePassage(test.getDatePassage());
        }
        
        dto.setAssignePar(test.getAssignePar());
        
        return dto;
    }
}
