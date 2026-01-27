package com.skill.backend.repository;

import com.skill.backend.entity.AffectationProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AffectationProjetRepository extends JpaRepository<AffectationProjet, String> {
    List<AffectationProjet> findByEmployeId(String employeId);
    List<AffectationProjet> findByProjetId(String projetId);
    List<AffectationProjet> findByEmployeIdAndStatut(String employeId, String statut);
}
