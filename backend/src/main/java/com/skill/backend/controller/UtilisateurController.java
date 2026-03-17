package com.skill.backend.controller;

import com.skill.backend.dto.UtilisateurDTO;
import com.skill.backend.entity.Utilisateur;
import com.skill.backend.repository.UtilisateurRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs", description = "Endpoints génériques pour les utilisateurs")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class UtilisateurController {

    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/search")
    @Operation(summary = "Rechercher des utilisateurs par nom ou prénom")
    public ResponseEntity<List<UtilisateurDTO>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(utilisateurRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(q, q)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList()));
    }

    private UtilisateurDTO toDTO(Utilisateur u) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(u.getId());
        dto.setNom(u.getNom());
        dto.setPrenom(u.getPrenom());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole().name());
        return dto;
    }
}
