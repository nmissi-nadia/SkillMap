package com.skill.backend.repository;

import com.skill.backend.entity.FormationEmploye;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormationEmployeRepository extends JpaRepository<FormationEmploye, String> {
    List<FormationEmploye> findByEmployeId(String employeId);
    List<FormationEmploye> findByFormationId(String formationId);
    List<FormationEmploye> findByStatut(String statut);
    List<FormationEmploye> findByEmployeIdAndStatut(String employeId, String statut);
}
