package com.skill.backend.service;

import com.skill.backend.dto.EmployeeMatchDTO;
import com.skill.backend.entity.Competence;
import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.entity.CompetenceRequiseProjet;
import com.skill.backend.entity.Employe;
import com.skill.backend.entity.Projet;
import com.skill.backend.repository.AffectationProjetRepository;
import com.skill.backend.repository.CompetenceEmployeRepository;
import com.skill.backend.repository.CompetenceRequiseProjetRepository;
import com.skill.backend.repository.EmployeRepository;
import com.skill.backend.repository.ProjetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SkillMatchingServiceTest {

    @Mock
    private EmployeRepository employeRepository;
    @Mock
    private ProjetRepository projetRepository;
    @Mock
    private CompetenceRequiseProjetRepository competenceRequiseProjetRepository;
    @Mock
    private AffectationProjetRepository affectationProjetRepository;
    @Mock
    private AuditLogService auditLogService;
    // competenceEmployeRepository mock removed as it's optimized out of the inner loop

    @InjectMocks
    private SkillMatchingService matchingService;

    private Projet projet;
    private Employe employeParfait;
    private Employe employeMoyen;

    @BeforeEach
    void setUp() {
        projet = new Projet();
        projet.setId("p1");
        projet.setNom("Migration Cloud");

        Competence java = new Competence();
        java.setId("c1");
        java.setNom("Java");

        CompetenceRequiseProjet req = new CompetenceRequiseProjet();
        req.setCompetence(java);
        req.setNiveauRequis(4);
        req.setPoids(1.0);

        List<CompetenceRequiseProjet> reqList = new ArrayList<>();
        reqList.add(req);

        // Define parfait
        employeParfait = new Employe();
        employeParfait.setId("e1");
        employeParfait.setNom("Doe");

        CompetenceEmploye ceParfait = new CompetenceEmploye();
        ceParfait.setCompetence(java);
        ceParfait.setNiveauManager(5);
        
        Set<CompetenceEmploye> set1 = new HashSet<>();
        set1.add(ceParfait);
        employeParfait.setCompetenceEmployes(set1);

        // Define moyen
        employeMoyen = new Employe();
        employeMoyen.setId("e2");
        employeMoyen.setNom("Smith");

        CompetenceEmploye ceMoyen = new CompetenceEmploye();
        ceMoyen.setCompetence(java);
        ceMoyen.setNiveauManager(2); // Incomplet

        Set<CompetenceEmploye> set2 = new HashSet<>();
        set2.add(ceMoyen);
        employeMoyen.setCompetenceEmployes(set2);

        // Mocks setup
        when(projetRepository.findById("p1")).thenReturn(Optional.of(projet));
        when(competenceRequiseProjetRepository.findByProjetId("p1")).thenReturn(reqList);
        when(employeRepository.findAllWithDetails()).thenReturn(List.of(employeParfait, employeMoyen));
        when(affectationProjetRepository.findByStatut("ACTIVE")).thenReturn(new ArrayList<>());
    }

    @Test
    void testFindBestMatchesForProject() {
        // execute
        List<EmployeeMatchDTO> matches = matchingService.findBestMatchesForProject("p1", 0);

        // assert
        assertEquals(2, matches.size());
        
        // e1 should be first, score 100%
        assertEquals("e1", matches.get(0).getEmployeId());
        assertEquals(100.0, matches.get(0).getMatchScore(), 0.1);
        
        // e2 should be second, score 50% (2/4)
        assertEquals("e2", matches.get(1).getEmployeId());
        assertEquals(50.0, matches.get(1).getMatchScore(), 0.1);
    }
}
