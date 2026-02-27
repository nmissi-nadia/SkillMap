package com.skill.backend.service;

import com.skill.backend.dto.MessageDTO;
import com.skill.backend.entity.Message;
import com.skill.backend.entity.Projet;
import com.skill.backend.entity.Utilisateur;
import com.skill.backend.repository.MessageRepository;
import com.skill.backend.repository.ProjetRepository;
import com.skill.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ProjetRepository projetRepository;

    private Utilisateur getConnectedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));
    }

    public List<MessageDTO> getMessagesProjet(String projetId) {
        return messageRepository.findByProjetIdOrderByDateEnvoiDesc(projetId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDTO envoyerMessage(MessageDTO dto) {
        Utilisateur expediteur = getConnectedUser();
        
        Projet projet = projetRepository.findById(dto.getProjetId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + dto.getProjetId()));

        Message message = new Message();
        message.setContenu(dto.getContenu());
        message.setExpediteur(expediteur);
        message.setProjet(projet);
        message.setDateEnvoi(LocalDateTime.now());
        message.setLu(false);

        if (dto.getDestinataireId() != null) {
            Utilisateur destinataire = utilisateurRepository.findById(dto.getDestinataireId())
                    .orElseThrow(() -> new RuntimeException("Destinataire non trouvé: " + dto.getDestinataireId()));
            message.setDestinataire(destinataire);
        }

        return toDTO(messageRepository.save(message));
    }

    @Transactional
    public void marquerLu(String messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé: " + messageId));
        message.setLu(true);
        messageRepository.save(message);
    }

    public long getNombreMessagesNonLus(String projetId) {
        Utilisateur user = getConnectedUser();
        return messageRepository.countByProjetIdAndDestinataireIdAndLuFalse(projetId, user.getId());
    }

    private MessageDTO toDTO(Message m) {
        MessageDTO dto = new MessageDTO();
        dto.setId(m.getId());
        dto.setContenu(m.getContenu());
        dto.setDateEnvoi(m.getDateEnvoi());
        dto.setLu(m.isLu());
        if (m.getExpediteur() != null) dto.setExpediteurId(m.getExpediteur().getId());
        if (m.getDestinataire() != null) dto.setDestinataireId(m.getDestinataire().getId());
        if (m.getProjet() != null) dto.setProjetId(m.getProjet().getId());
        return dto;
    }
}
