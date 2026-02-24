package com.skill.backend.repository;

import com.skill.backend.entity.Projet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, String> {
    List<Projet> findByChefProjetId(String chefProjetId);
    List<Projet> findByStatut(String statut);
}
