package com.skill.backend.controller;

import com.skill.backend.dto.NotificationDTO;
import com.skill.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des notifications.
 * Expose uniquement les notifications de l'utilisateur authentifié (JWT).
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Gestion des notifications utilisateur")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Récupérer toutes les notifications de l'utilisateur connecté avec pagination.
     */
    @GetMapping
    @Operation(summary = "Toutes mes notifications (paginé)")
    public ResponseEntity<Page<NotificationDTO>> getMyNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = authentication.getName();
        return ResponseEntity.ok(notificationService.getNotifications(userId, PageRequest.of(page, size)));
    }

    /**
     * Récupérer les dernières notifications (pour le popup de la cloche).
     */
    @GetMapping("/latest")
    @Operation(summary = "Mes dernières notifications")
    public ResponseEntity<List<NotificationDTO>> getLatestNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "5") int limit) {
        String userId = authentication.getName();
        return ResponseEntity.ok(notificationService.getLatestNotifications(userId, limit));
    }

    /**
     * Récupérer les notifications non lues de l'utilisateur connecté.
     */
    @GetMapping("/unread")
    @Operation(summary = "Mes notifications non lues")
    public ResponseEntity<List<NotificationDTO>> getMyUnreadNotifications(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    /**
     * Nombre de notifications non lues.
     */
    @GetMapping("/count/unread")
    @Operation(summary = "Nombre de notifications non lues")
    public ResponseEntity<Map<String, Long>> countUnread(Authentication authentication) {
        String userId = authentication.getName();
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Marquer une notification spécifique comme lue.
     */
    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Marquer une notification comme lue")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Marquer toutes les notifications comme lues.
     */
    @PutMapping("/read-all")
    @Operation(summary = "Marquer toutes les notifications comme lues")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String userId = authentication.getName();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Supprimer une notification.
     */
    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Supprimer une notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }
}
