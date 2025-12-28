package com.skill.backend.repository;

import com.skill.backend.entity.CompetenceEmploye;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompetenceEmployeRepository extends JpaRepository<CompetenceEmploye, String> {
}
