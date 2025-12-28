package com.skill.backend.repository;

import com.skill.backend.entity.AffectationProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AffectationProjetRepository extends JpaRepository<AffectationProjet, String> {
}
