package com.skill.backend.controller;

import com.skill.backend.dto.MessageDTO;
import com.skill.backend.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Messagerie interne aux projets")
@SecurityRequirement(name = "bearerAuth")
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/projet/{projetId}")
    @Operation(summary = "Messages d'un projet")
    public ResponseEntity<List<MessageDTO>> getMessagesProjet(@PathVariable String projetId) {
        return ResponseEntity.ok(messageService.getMessagesProjet(projetId));
    }

    @PostMapping
    @Operation(summary = "Envoyer un message")
    public ResponseEntity<MessageDTO> envoyerMessage(@RequestBody MessageDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.envoyerMessage(dto));
    }

    @PutMapping("/{id}/lu")
    @Operation(summary = "Marquer un message comme lu")
    public ResponseEntity<Void> marquerLu(@PathVariable String id) {
        messageService.marquerLu(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projet/{projetId}/non-lus")
    @Operation(summary = "Nombre de messages non lus")
    public ResponseEntity<Long> getNombreMessagesNonLus(@PathVariable String projetId) {
        return ResponseEntity.ok(messageService.getNombreMessagesNonLus(projetId));
    }
}
