package com.skill.backend.repository;

import com.skill.backend.entity.ReponseEmploye;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReponseEmployeRepository extends JpaRepository<ReponseEmploye, String> {
    List<ReponseEmploye> findByTestEmployeId(String testEmployeId);
    List<ReponseEmploye> findByQuestionId(String questionId);
}
