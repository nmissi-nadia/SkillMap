package com.skill.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'emails
 */
@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired(required = false)
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        if (mailSender == null) {
            log.warn("JavaMailSender n'est pas configuré. Les emails ne seront pas envoyés.");
        }
    }

    /**
     * Envoyer un email de bienvenue avec les identifiants
     */
    public void sendWelcomeEmail(String to, String fullName, String email, String temporaryPassword) {
        if (mailSender == null) {
            log.warn("Email non envoyé (JavaMailSender non configuré) - Destinataire: {}", to);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Bienvenue sur SkillMap - Vos identifiants de connexion");
            message.setText(buildWelcomeEmailContent(fullName, email, temporaryPassword));
            
            mailSender.send(message);
            log.info("Email de bienvenue envoyé à: {}", to);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email à: {}", to, e);
            // Ne pas bloquer la création de l'utilisateur si l'email échoue
        }
    }

    /**
     * Construire le contenu de l'email de bienvenue
     */
    private String buildWelcomeEmailContent(String fullName, String email, String temporaryPassword) {
        return String.format("""
            Bonjour %s,
            
            Bienvenue sur SkillMap - Plateforme de Gestion des Compétences !
            
            Votre compte a été créé avec succès. Voici vos identifiants de connexion :
            
            Email : %s
            Mot de passe temporaire : %s
            
            IMPORTANT : Pour des raisons de sécurité, nous vous recommandons fortement de changer votre mot de passe lors de votre première connexion.
            
            Vous pouvez accéder à la plateforme via : http://localhost:8085
            
            Si vous avez des questions, n'hésitez pas à contacter le service RH.
            
            Cordialement,
            L'équipe SkillMap
            """, fullName, email, temporaryPassword);
    }

    /**
     * Envoyer un email de réinitialisation de mot de passe
     */
    public void sendPasswordResetEmail(String to, String fullName, String resetToken) {
        if (mailSender == null) {
            log.warn("Email de réinitialisation non envoyé (JavaMailSender non configuré) - Destinataire: {}", to);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("SkillMap - Réinitialisation de mot de passe");
            message.setText(buildPasswordResetEmailContent(fullName, resetToken));
            
            mailSender.send(message);
            log.info("Email de réinitialisation envoyé à: {}", to);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de réinitialisation à: {}", to, e);
        }
    }

    /**
     * Construire le contenu de l'email de réinitialisation
     */
    private String buildPasswordResetEmailContent(String fullName, String resetToken) {
        return String.format("""
            Bonjour %s,
            
            Vous avez demandé la réinitialisation de votre mot de passe SkillMap.
            
            Votre code de réinitialisation : %s
            
            Ce code est valable pendant 15 minutes.
            
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            
            Cordialement,
            L'équipe SkillMap
            """, fullName, resetToken);
    }
}
