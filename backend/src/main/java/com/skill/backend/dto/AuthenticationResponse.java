package com.skill.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.skill.backend.enums.RoleUtilisateur;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    @JsonProperty("access_token")
    private String accessToken;
    @JsonProperty("refresh_token")
    private String refreshToken;
    
    // Informations utilisateur
    private String id;
    private String email;
    private String nom;
    private String prenom;
    private RoleUtilisateur role;
}
