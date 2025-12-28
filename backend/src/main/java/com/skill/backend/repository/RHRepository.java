package com.skill.backend.repository;

import com.skill.backend.entity.RH;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RHRepository extends JpaRepository<RH, String> {
}
