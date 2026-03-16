package com.skill.backend.service;

import com.skill.backend.dto.*;
import com.skill.backend.entity.*;
import com.skill.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UtilisateurRepository utilisateurRepository;

    private Utilisateur getConnectedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> getUserConversations() {
        Utilisateur user = getConnectedUser();
        return conversationRepository.findByParticipantIdOrderByDateCreationDesc(user.getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDTO createConversation(CreateConversationDTO dto) {
        Utilisateur creator = getConnectedUser();
        
        Conversation conversation = new Conversation();
        conversation.setTitre(dto.getTitre());
        conversation.setDateCreation(LocalDateTime.now());
        
        conversation.getParticipants().add(creator);
        // Ajout des participants sans doubler le créateur
        if (dto.getParticipantIds() != null) {
            for (String id : dto.getParticipantIds()) {
                if (!id.equals(creator.getId())) {
                    Utilisateur participant = utilisateurRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + id));
                    conversation.getParticipants().add(participant);
                }
            }
        }
        
        return toDTO(conversationRepository.save(conversation));
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getConversationMessages(String conversationId) {
        Utilisateur user = getConnectedUser();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée: " + conversationId));
                
        boolean isParticipant = conversation.getParticipants().stream().anyMatch(p -> p.getId().equals(user.getId()));
        if (!isParticipant) {
             throw new RuntimeException("Vous n'êtes pas participant de cette conversation");
        }
        
        return messageRepository.findByConversationIdOrderByDateEnvoiAsc(conversationId)
                .stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public MessageDTO sendMessageToConversation(String conversationId, MessageDTO dto) {
        Utilisateur expediteur = getConnectedUser();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée: " + conversationId));
                
        Message message = new Message();
        message.setContenu(dto.getContenu());
        message.setExpediteur(expediteur);
        message.setConversation(conversation);
        message.setDateEnvoi(LocalDateTime.now());
        message.setLu(false);
        
        return toMessageDTO(messageRepository.save(message));
    }

    private ConversationDTO toDTO(Conversation c) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(c.getId());
        dto.setTitre(c.getTitre());
        dto.setDateCreation(c.getDateCreation());
        
        dto.setParticipants(c.getParticipants().stream().map(p -> {
            UtilisateurDTO u = new UtilisateurDTO();
            u.setId(p.getId());
            u.setNom(p.getNom());
            u.setPrenom(p.getPrenom());
            u.setEmail(p.getEmail());
            return u;
        }).collect(Collectors.toList()));
        
        if (!c.getMessages().isEmpty()) {
            Message lastMsg = c.getMessages().get(c.getMessages().size() - 1);
            dto.setDernierMessage(toMessageDTO(lastMsg));
        }
        return dto;
    }
    
    private MessageDTO toMessageDTO(Message m) {
        MessageDTO dto = new MessageDTO();
        dto.setId(m.getId());
        dto.setContenu(m.getContenu());
        dto.setDateEnvoi(m.getDateEnvoi());
        dto.setLu(m.isLu());
        if (m.getExpediteur() != null) dto.setExpediteurId(m.getExpediteur().getId());
        if (m.getDestinataire() != null) dto.setDestinataireId(m.getDestinataire().getId());
        if (m.getProjet() != null) dto.setProjetId(m.getProjet().getId());
        if (m.getConversation() != null) dto.setConversationId(m.getConversation().getId());
        return dto;
    }
}
