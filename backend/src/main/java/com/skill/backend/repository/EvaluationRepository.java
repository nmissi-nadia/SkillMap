package com.skill.backend.repository;

import com.skill.backend.entity.Evaluation;
import com.skill.backend.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, String> {
    List<Evaluation> findByManagerAndStatut(Manager manager, String statut);
    List<Evaluation> findByEmployeId(String employeId);
}
