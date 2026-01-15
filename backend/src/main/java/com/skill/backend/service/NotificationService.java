package com.skill.backend.service;

import com.skill.backend.entity.Notification;
import com.skill.backend.entity.Utilisateur;
import com.skill.backend.repository.NotificationRepository;
import com.skill.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Créer une notification pour un utilisateur
     */
    public Notification createNotification(String userId, String titre, String contenu, String type) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Notification notification = new Notification();
        notification.setUtilisateur(utilisateur);
        notification.setTitre(titre);
        notification.setContenu(contenu);
        notification.setType(type);
        notification.setLu(false);
        notification.setDateEnvoi(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    /**
     * Notifier le manager d'une modification de profil
     */
    public void notifyManagerProfilUpdate(String managerId, String employeNom, String employePrenom) {
        String titre = "Modification de profil";
        String contenu = String.format("%s %s a modifié son profil", employePrenom, employeNom);
        createNotification(managerId, titre, contenu, "INFO");
    }

    /**
     * Notifier le manager d'une auto-évaluation
     */
    public void notifyManagerAutoEvaluation(String managerId, String employeNom, String employePrenom, String competenceNom) {
        String titre = "Nouvelle auto-évaluation";
        String contenu = String.format("%s %s a effectué une auto-évaluation pour la compétence '%s'", 
            employePrenom, employeNom, competenceNom);
        createNotification(managerId, titre, contenu, "ACTION");
    }

    /**
     * Notifier l'employé de la validation de son évaluation
     */
    public void notifyEmployeValidation(String employeId, String competenceNom, boolean validee) {
        String titre = validee ? "Évaluation validée" : "Évaluation rejetée";
        String contenu = validee 
            ? String.format("Votre auto-évaluation pour '%s' a été validée par votre manager", competenceNom)
            : String.format("Votre auto-évaluation pour '%s' a été rejetée par votre manager", competenceNom);
        createNotification(employeId, titre, contenu, validee ? "INFO" : "ALERTE");
    }

    /**
     * Récupérer les notifications d'un utilisateur
     */
    public List<Notification> getNotifications(String userId) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return notificationRepository.findByUtilisateurOrderByDateEnvoiDesc(utilisateur);
    }

    /**
     * Récupérer les notifications non lues
     */
    public List<Notification> getUnreadNotifications(String userId) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return notificationRepository.findByUtilisateurAndLuFalseOrderByDateEnvoiDesc(utilisateur);
    }

    /**
     * Marquer une notification comme lue
     */
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setLu(true);
            notificationRepository.save(notification);
        });
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    public void markAllAsRead(String userId) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        List<Notification> notifications = notificationRepository.findByUtilisateurAndLuFalse(utilisateur);
        notifications.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(notifications);
    }
}
