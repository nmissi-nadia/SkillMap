package com.skill.backend.repository;

import com.skill.backend.entity.Employe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeRepository extends JpaRepository<Employe, String> {
    List<Employe> findByManagerId(String managerId);
}
