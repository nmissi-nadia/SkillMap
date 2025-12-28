package com.skill.backend.repository;

import com.skill.backend.entity.TestTechnique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestTechniqueRepository extends JpaRepository<TestTechnique, String> {
}
