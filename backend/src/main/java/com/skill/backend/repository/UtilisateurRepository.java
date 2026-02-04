package com.skill.backend.repository;

import com.skill.backend.entity.Utilisateur;
import com.skill.backend.enums.RoleUtilisateur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, String> {
    Optional<Utilisateur> findByEmail(String email);
    Page<Utilisateur> findByRole(RoleUtilisateur role, Pageable pageable);
}
