package com.skill.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "SkillMap API",
                version = "1.0",
                description = "API de gestion des compétences et des employés",
                contact = @Contact(
                        name = "SkillMap Team",
                        email = "support@skillmap.com"
                )
        ),
        servers = {
                @Server(
                        description = "Local Environment",
                        url = "http://localhost:8080"
                ),
                @Server(
                        description = "Docker Environment",
                        url = "http://localhost:8080"
                )
        }
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT authentication",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
