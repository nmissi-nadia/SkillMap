package com.skill.backend.controller;

import com.skill.backend.dto.ConversationDTO;
import com.skill.backend.dto.CreateConversationDTO;
import com.skill.backend.dto.MessageDTO;
import com.skill.backend.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversations", description = "Gestion des conversations de groupe et privées")
@SecurityRequirement(name = "bearerAuth")
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Récupérer les conversations de l'utilisateur")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable String userId) {
        // userId est passé formellement pour l'URL mais le service utilise le context de sécurité
        return ResponseEntity.ok(conversationService.getUserConversations());
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle conversation")
    public ResponseEntity<ConversationDTO> createConversation(@RequestBody CreateConversationDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversationService.createConversation(dto));
    }

    @GetMapping("/{conversationId}/messages")
    @Operation(summary = "Récupérer les messages d'une conversation")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(@PathVariable String conversationId) {
        return ResponseEntity.ok(conversationService.getConversationMessages(conversationId));
    }

    @PostMapping("/{conversationId}/messages")
    @Operation(summary = "Envoyer un message à une conversation")
    public ResponseEntity<MessageDTO> sendMessageToConversation(
            @PathVariable String conversationId,
            @RequestBody MessageDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversationService.sendMessageToConversation(conversationId, dto));
    }
}
