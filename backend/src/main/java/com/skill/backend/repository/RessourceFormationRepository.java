package com.skill.backend.repository;

import com.skill.backend.entity.RessourceFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RessourceFormationRepository extends JpaRepository<RessourceFormation, String> {
    List<RessourceFormation> findByFormationId(String formationId);
}
