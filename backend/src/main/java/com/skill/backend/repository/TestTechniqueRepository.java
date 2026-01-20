package com.skill.backend.repository;

import com.skill.backend.entity.Employe;
import com.skill.backend.entity.TestTechnique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestTechniqueRepository extends JpaRepository<TestTechnique, String> {
    List<TestTechnique> findByEmployeAndResultat(Employe employe, String resultat);
}
