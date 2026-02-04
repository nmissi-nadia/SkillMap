package com.skill.backend.controller;

import com.skill.backend.dto.AuthenticationRequest;
import com.skill.backend.dto.AuthenticationResponse;
import com.skill.backend.dto.RegisterRequest;
import com.skill.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // Avec JWT, le logout est géré côté client en supprimant le token
        // Ici on retourne juste un message de confirmation
        return ResponseEntity.ok("Déconnexion réussie");
    }
}
