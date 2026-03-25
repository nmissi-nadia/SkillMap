package com.skill.backend;

import com.skill.backend.config.JwtAuthenticationFilter;
import com.skill.backend.repository.*;
import com.skill.backend.service.JwtService;
import com.skill.backend.service.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;

/**
 * Tests de démarrage du contexte Spring.
 * Utilise un profil de test avec H2 et des mocks pour les services externes.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class BackendApplicationTests {

    // Mock all beans that require external services or complex setup
    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @MockBean
    private JavaMailSender javaMailSender;

    @MockBean
    private com.skill.backend.service.ManagerService managerService;

    @MockBean
    private com.skill.backend.service.RHService rhService;

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts without errors
    }
}
