package com.skill.backend.service;

import com.skill.backend.dto.NotificationDTO;
import com.skill.backend.entity.Notification;
import com.skill.backend.entity.Utilisateur;
import com.skill.backend.mapper.NotificationMapper;
import com.skill.backend.repository.NotificationRepository;
import com.skill.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion des notifications.
 * Responsable de la création, la récupération, le marquage et le push WebSocket.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    // ─────────────────────────────────────────────────────────────
    // Core: Create & Push
    // ─────────────────────────────────────────────────────────────

    /**
     * Crée une notification en base et la pousse via WebSocket.
     */
    @Transactional
    public NotificationDTO createAndPush(String userId, String titre, String contenu,
                                          String type, String lien, String senderId, String senderNom) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId).orElse(null);
        if (utilisateur == null) {
            log.warn("⚠️ NotificationService: utilisateur {} introuvable, notification ignorée", userId);
            return null;
        }

        Notification notification = new Notification();
        notification.setUtilisateur(utilisateur);
        notification.setTitre(titre);
        notification.setContenu(contenu);
        notification.setType(type);
        notification.setLu(false);
        notification.setDateEnvoi(LocalDateTime.now());
        notification.setLien(lien);
        notification.setSenderId(senderId);
        notification.setSenderNom(senderNom);

        Notification saved = notificationRepository.save(notification);
        NotificationDTO dto = notificationMapper.toDto(saved);

        // Push temps réel vers l'utilisateur via WebSocket
        try {
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", dto);
            log.debug("🔔 Notification WebSocket envoyée à {}: {}", userId, titre);
        } catch (Exception e) {
            log.warn("⚠️ Impossible d'envoyer la notification WebSocket: {}", e.getMessage());
        }

        return dto;
    }

    /**
     * Crée une notification simple sans expéditeur ni lien.
     */
    @Transactional
    public NotificationDTO create(String userId, String titre, String contenu, String type) {
        return createAndPush(userId, titre, contenu, type, null, null, "Système");
    }

    // ─────────────────────────────────────────────────────────────
    // Notifications contextuelles (appelées par les autres services)
    // ─────────────────────────────────────────────────────────────

    /** Notification lors de l'assignation à un projet */
    public void notifyProjectAssignment(String employeId, String projetNom, String managerId, String managerNom) {
        createAndPush(employeId,
                "Affectation à un projet",
                "Vous avez été affecté(e) au projet « " + projetNom + " »",
                "ACTION", "/projets", managerId, managerNom);
    }

    /** Notification lors de l'inscription à une formation */
    public void notifyFormationAssignment(String employeId, String formationTitre, String rhId, String rhNom) {
        createAndPush(employeId,
                "Inscription à une formation",
                "Vous avez été inscrit(e) à la formation « " + formationTitre + " »",
                "ACTION", "/formations", rhId, rhNom);
    }

    /** Notification lors de l'assignation d'un test technique */
    public void notifyTestAssignment(String employeId, String testTitre, String managerId, String managerNom) {
        createAndPush(employeId,
                "Nouveau test technique",
                "Un test technique « " + testTitre + " » vous a été assigné",
                "ACTION", "/tests", managerId, managerNom);
    }

    /** Notification lors de la validation d'une compétence */
    public void notifySkillValidation(String employeId, String competenceNom, boolean validee, String managerId, String managerNom) {
        String titre = validee ? "✅ Compétence validée" : "❌ Évaluation rejetée";
        String contenu = validee
                ? "Votre évaluation de « " + competenceNom + " » a été validée"
                : "Votre évaluation de « " + competenceNom + " » a été rejetée";
        createAndPush(employeId, titre, contenu,
                validee ? "SUCCESS" : "ALERTE",
                "/profile", managerId, managerNom);
    }

    /** Notification lors de la création d'un compte utilisateur */
    public void notifyNewUser(String userId, String nom, String prenom) {
        createAndPush(userId,
                "Bienvenue sur SkillMap 🎉",
                "Bonjour " + prenom + " " + nom + ", votre compte a bien été créé !",
                "INFO", "/dashboard", null, "Administration");
    }

    /** Notifier le manager d'une modification de profil */
    public void notifyManagerProfilUpdate(String managerId, String employeNom, String employePrenom) {
        create(managerId,
                "Modification de profil",
                employePrenom + " " + employeNom + " a modifié son profil",
                "INFO");
    }

    /** Notifier le manager d'une auto-évaluation */
    public void notifyManagerAutoEvaluation(String managerId, String employeNom, String employePrenom, String competenceNom) {
        create(managerId,
                "Nouvelle auto-évaluation",
                employePrenom + " " + employeNom + " a soumis une auto-évaluation pour « " + competenceNom + " »",
                "ACTION");
    }

    /** Notifier l'employé de la validation de son évaluation */
    public void notifyEmployeValidation(String employeId, String competenceNom, boolean validee) {
        notifySkillValidation(employeId, competenceNom, validee, null, "Manager");
    }

    // ─────────────────────────────────────────────────────────────
    // Lecture et gestion
    // ─────────────────────────────────────────────────────────────

    /** Toutes les notifications d'un utilisateur (version dépréciée) */
    public List<NotificationDTO> getNotifications(String userId) {
        return notificationRepository.findByUtilisateurIdOrderByDateEnvoiDesc(userId)
                .stream().map(notificationMapper::toDto).collect(Collectors.toList());
    }

    /** Toutes les notifications d'un utilisateur avec pagination */
    public Page<NotificationDTO> getNotifications(String userId, Pageable pageable) {
        return notificationRepository.findByUtilisateurIdOrderByDateEnvoiDesc(userId, pageable)
                .map(notificationMapper::toDto);
    }

    /** Récupérer les X dernières notifications (pour le popup) */
    public List<NotificationDTO> getLatestNotifications(String userId, int limit) {
        Pageable limitPage = PageRequest.of(0, limit);
        return notificationRepository.findByUtilisateurIdOrderByDateEnvoiDesc(userId, limitPage)
                .stream().map(notificationMapper::toDto).collect(Collectors.toList());
    }

    /** Notifications non lues seulement */
    public List<NotificationDTO> getUnreadNotifications(String userId) {
        return notificationRepository.findByUtilisateurIdAndLuFalseOrderByDateEnvoiDesc(userId)
                .stream().map(notificationMapper::toDto).collect(Collectors.toList());
    }

    /** Nombre de notifications non lues */
    public long countUnread(String userId) {
        return notificationRepository.countByUtilisateurIdAndLuFalse(userId);
    }

    /** Marquer une notification comme lue */
    @Transactional
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setLu(true);
            notificationRepository.save(n);
        });
    }

    /** Marquer toutes les notifications d'un utilisateur comme lues */
    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUtilisateurIdAndLuFalse(userId);
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
    }

    /** Supprimer une notification */
    @Transactional
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    /** Envoyer une notification simple (méthode de commodité) */
    public void sendNotification(String userId, String titre, String contenu) {
        create(userId, titre, contenu, "INFO");
    }

    /** Créer une notification (compatibilité ancienne API) */
    @Transactional
    public Notification createNotification(String userId, String titre, String contenu, String type) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + userId));
        Notification notification = new Notification();
        notification.setUtilisateur(utilisateur);
        notification.setTitre(titre);
        notification.setContenu(contenu);
        notification.setType(type);
        notification.setLu(false);
        notification.setDateEnvoi(LocalDateTime.now());
        notification.setSenderNom("Système");
        return notificationRepository.save(notification);
    }

    /** Récupérer les notifications (compatibilité ancienne API - retourne entités) */
    public List<Notification> getNotificationsEntities(String userId) {
        return notificationRepository.findByUtilisateurIdOrderByDateEnvoiDesc(userId);
    }

    /** Récupérer les non lues (compatibilité ancienne API - retourne entités) */
    public List<Notification> getUnreadNotificationsEntities(String userId) {
        return notificationRepository.findByUtilisateurIdAndLuFalseOrderByDateEnvoiDesc(userId);
    }
}
