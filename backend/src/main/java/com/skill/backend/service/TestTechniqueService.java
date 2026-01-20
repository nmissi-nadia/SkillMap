package com.skill.backend.service;

import com.skill.backend.dto.TestTechniqueRequestDTO;
import com.skill.backend.dto.TestTechniqueResultDTO;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.TestTechnique;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.TestTechniqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestTechniqueService {

    private final TestTechniqueRepository testTechniqueRepository;
    private final EmployeRepository employeRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Assigner un test technique à un employé
     */
    @PreAuthorize("hasAnyRole('RH', 'MANAGER')")
    public TestTechnique assignerTest(TestTechniqueRequestDTO request, String assignedBy) {
        Employe employe = employeRepository.findById(request.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        TestTechnique test = new TestTechnique();
        test.setTitre(request.getTitre());
        test.setTechnologie(request.getTechnologie());
        test.setEmploye(employe);
        test.setScore(0.0);
        test.setResultat("EN_ATTENTE");
        
        TestTechnique saved = testTechniqueRepository.save(test);

        // Log l'assignation
        auditLogService.logAction(assignedBy, "ASSIGN_TEST", "TEST_TECHNIQUE", 
            null, "Test: " + request.getTitre() + " assigné à " + employe.getNom());

        // Notifier l'employé
        notificationService.createNotification(
            employe.getId(),
            "Nouveau test technique",
            "Un test technique '" + request.getTitre() + "' vous a été assigné",
            "ACTION"
        );

        return saved;
    }

    /**
     * Enregistrer le résultat d'un test
     */
    @PreAuthorize("hasRole('EMPLOYE')")
    public TestTechnique enregistrerResultat(String testId, TestTechniqueResultDTO result) {
        TestTechnique test = testTechniqueRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test non trouvé"));

        // Calculer le score automatiquement (exemple simple)
        double score = calculateScore(result);
        String resultat = score >= 70 ? "REUSSI" : "ECHOUE";

        test.setScore(score);
        test.setResultat(resultat);
        test.setDatePassage(LocalDateTime.now());
        
        TestTechnique updated = testTechniqueRepository.save(test);

        // Log le résultat
        auditLogService.logAction(test.getEmploye().getId(), "COMPLETE_TEST", "TEST_TECHNIQUE",
            null, "Score: " + score + ", Résultat: " + resultat);

        // Notifier l'employé du résultat
        notificationService.createNotification(
            test.getEmploye().getId(),
            "Résultat de test",
            "Votre test '" + test.getTitre() + "' : " + resultat + " (Score: " + score + "%)",
            resultat.equals("REUSSI") ? "INFO" : "ALERTE"
        );

        // Notifier le manager si le test est réussi
        if (test.getEmploye().getManager() != null && resultat.equals("REUSSI")) {
            notificationService.createNotification(
                test.getEmploye().getManager().getId(),
                "Test réussi",
                test.getEmploye().getPrenom() + " " + test.getEmploye().getNom() + 
                " a réussi le test '" + test.getTitre() + "' avec " + score + "%",
                "INFO"
            );
        }

        return updated;
    }

    /**
     * Récupérer les tests en cours pour un employé
     */
    public List<TestTechnique> getTestsEnCours(String employeId) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        return testTechniqueRepository.findByEmployeAndResultat(employe, "EN_ATTENTE");
    }

    /**
     * Calculer le score d'un test (logique simplifiée)
     */
    private double calculateScore(TestTechniqueResultDTO result) {
        // Exemple simple : moyenne des réponses correctes
        if (result.getTotalQuestions() == 0) return 0.0;
        return (result.getCorrectAnswers() * 100.0) / result.getTotalQuestions();
    }
}
