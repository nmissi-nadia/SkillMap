package com.skill.backend.repository;

import com.skill.backend.entity.CompetenceRequiseProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetenceRequiseProjetRepository extends JpaRepository<CompetenceRequiseProjet, String> {
    List<CompetenceRequiseProjet> findByProjetId(String projetId);
    List<CompetenceRequiseProjet> findByCompetenceId(String competenceId);
}
