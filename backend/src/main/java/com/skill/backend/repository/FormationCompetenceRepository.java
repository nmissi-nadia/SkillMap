package com.skill.backend.repository;

import com.skill.backend.entity.FormationCompetence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormationCompetenceRepository extends JpaRepository<FormationCompetence, String> {
    List<FormationCompetence> findByFormationId(String formationId);
    List<FormationCompetence> findByCompetenceId(String competenceId);
}
