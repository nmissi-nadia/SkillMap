package com.skill.backend.repository;

import com.skill.backend.entity.Notification;
import com.skill.backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUtilisateurOrderByDateEnvoiDesc(Utilisateur utilisateur);
    List<Notification> findByUtilisateurAndLuFalseOrderByDateEnvoiDesc(Utilisateur utilisateur);
    List<Notification> findByUtilisateurAndLuFalse(Utilisateur utilisateur);
}
