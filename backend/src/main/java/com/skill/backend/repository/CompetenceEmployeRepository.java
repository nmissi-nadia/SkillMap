package com.skill.backend.repository;

import com.skill.backend.entity.CompetenceEmploye;
import com.skill.backend.entity.Employe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetenceEmployeRepository extends JpaRepository<CompetenceEmploye, String> {
    List<CompetenceEmploye> findByEmploye(Employe employe);
    Optional<CompetenceEmploye> findByEmployeIdAndCompetenceId(String employeId, String competenceId);
}
