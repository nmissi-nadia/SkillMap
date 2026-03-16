package com.skill.backend.repository;

import com.skill.backend.entity.TestEmploye;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestEmployeRepository extends JpaRepository<TestEmploye, String> {
    List<TestEmploye> findByEmployeId(String employeId);
    Optional<TestEmploye> findByTestTechniqueIdAndEmployeId(String testTechniqueId, String employeId);
    List<TestEmploye> findByTestTechniqueId(String testTechniqueId);
    List<TestEmploye> findByManagerId(String managerId);
    long countByManagerIdAndStatutIn(String managerId, List<String> statuts);
}
