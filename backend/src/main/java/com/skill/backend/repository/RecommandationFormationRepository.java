package com.skill.backend.repository;

import com.skill.backend.entity.RecommandationFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommandationFormationRepository extends JpaRepository<RecommandationFormation, String> {
    List<RecommandationFormation> findByEmployeId(String employeId);
    List<RecommandationFormation> findByStatut(String statut);
    List<RecommandationFormation> findByEmployeIdAndStatut(String employeId, String statut);
}
