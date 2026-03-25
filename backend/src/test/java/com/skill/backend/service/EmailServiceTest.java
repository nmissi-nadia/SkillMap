package com.skill.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender);
    }

    @Test
    void sendWelcomeEmail_shouldSendEmail_whenSenderExists() {
        emailService.sendWelcomeEmail("to@example.com", "John Doe", "john@example.com", "pass123");
        
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        
        SimpleMailMessage message = messageCaptor.getValue();
        assertThat(message.getTo()).contains("to@example.com");
        assertThat(message.getSubject()).contains("Bienvenue");
        assertThat(message.getText()).contains("pass123");
    }

    @Test
    void sendWelcomeEmail_shouldNotFail_whenSenderIsNull() {
        EmailService noSenderService = new EmailService(null);
        noSenderService.sendWelcomeEmail("to@example.com", "John Doe", "john@example.com", "pass123");
        // No exception thrown
    }

    @Test
    void sendWelcomeEmail_shouldCatchException() {
        doThrow(new RuntimeException("Mail error")).when(mailSender).send(any(SimpleMailMessage.class));
        emailService.sendWelcomeEmail("to@example.com", "John Doe", "john@example.com", "pass123");
        // Should catch and log error, not throw
    }

    @Test
    void sendPasswordResetEmail_shouldSendEmail() {
        emailService.sendPasswordResetEmail("to@example.com", "John Doe", "RESET-123");
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendPasswordResetEmail_shouldNotFail_whenSenderIsNull() {
        EmailService noSenderService = new EmailService(null);
        noSenderService.sendPasswordResetEmail("to@example.com", "John Doe", "RESET-123");
    }

    @Test
    void sendPasswordResetEmail_shouldCatchException() {
        doThrow(new RuntimeException("Mail error")).when(mailSender).send(any(SimpleMailMessage.class));
        emailService.sendPasswordResetEmail("to@example.com", "John Doe", "RESET-123");
    }
}
