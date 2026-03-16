import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Participant {
    id: string;
    nom: string;
    prenom: string;
}

export interface MessageDTO {
    id: string;
    expediteurId: string;
    expediteurNom: string;
    expediteurPrenom: string;
    contenu: string;
    dateEnvoi: string;
    conversationId: string;
}

export interface ConversationDTO {
    id: string;
    titre: string;
    dateCreation: string;
    participants: Participant[];
    dernierMessage: MessageDTO;
}

export interface CreateConversationDTO {
    titre: string;
    participantIds: string[];
}

@Injectable({
    providedIn: 'root'
})
export class MessagingService {

    private readonly API_URL = `${environment.apiUrl}/api/conversations`;

    constructor(private http: HttpClient) { }

    getUserConversations(userId: string): Observable<ConversationDTO[]> {
        return this.http.get<ConversationDTO[]>(`${this.API_URL}/user/${userId}`);
    }

    createConversation(dto: CreateConversationDTO): Observable<ConversationDTO> {
        return this.http.post<ConversationDTO>(this.API_URL, dto);
    }

    getMessages(conversationId: string): Observable<MessageDTO[]> {
        return this.http.get<MessageDTO[]>(`${this.API_URL}/${conversationId}/messages`);
    }

    sendMessage(conversationId: string, contenu: string): Observable<MessageDTO> {
        return this.http.post<MessageDTO>(`${this.API_URL}/${conversationId}/messages`, { contenu });
    }
}
