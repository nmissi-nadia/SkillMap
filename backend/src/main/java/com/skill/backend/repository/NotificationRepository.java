package com.skill.backend.repository;

import com.skill.backend.entity.Notification;
import com.skill.backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    // --- Par entité Utilisateur (heritage) ---
    List<Notification> findByUtilisateurOrderByDateEnvoiDesc(Utilisateur utilisateur);
    List<Notification> findByUtilisateurAndLuFalseOrderByDateEnvoiDesc(Utilisateur utilisateur);
    List<Notification> findByUtilisateurAndLuFalse(Utilisateur utilisateur);

    // --- Par userId (plus performant, pas de join) ---
    List<Notification> findByUtilisateurIdOrderByDateEnvoiDesc(String userId);
    List<Notification> findByUtilisateurIdAndLuFalseOrderByDateEnvoiDesc(String userId);
    List<Notification> findByUtilisateurIdAndLuFalse(String userId);
    long countByUtilisateurIdAndLuFalse(String userId);
}
