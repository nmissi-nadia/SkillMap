import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Projet,
    ProjetCreate,
    MembreEquipe,
    AffectationRequest,
    EmployeeMatch,
    MessageProjet,
    MessageCreate,
    ProjetStats
} from '../models/chef-projet.model';

@Injectable({
    providedIn: 'root'
})
export class ChefProjetService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}`;

    // =========================================================
    // GESTION DES PROJETS
    // =========================================================

    getMesProjets(): Observable<Projet[]> {
        return this.http.get<Projet[]>(`${this.apiUrl}/projets/me`);
    }

    getAllProjets(): Observable<Projet[]> {
        return this.http.get<Projet[]>(`${this.apiUrl}/projets`);
    }

    getProjetById(id: string): Observable<Projet> {
        return this.http.get<Projet>(`${this.apiUrl}/projets/${id}`);
    }

    createProjet(projet: ProjetCreate): Observable<Projet> {
        return this.http.post<Projet>(`${this.apiUrl}/projets`, projet);
    }

    updateProjet(id: string, projet: Partial<ProjetCreate>): Observable<Projet> {
        return this.http.put<Projet>(`${this.apiUrl}/projets/${id}`, projet);
    }

    deleteProjet(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/projets/${id}`);
    }

    getProjetStats(): Observable<ProjetStats> {
        return this.http.get<ProjetStats>(`${this.apiUrl}/projets/me/stats`);
    }

    // =========================================================
    // MATCHING COMPÉTENCES ↔ PROJET
    // =========================================================

    lancerMatching(projetId: string, scoreMin: number = 50): Observable<EmployeeMatch[]> {
        const params = new HttpParams().set('minScore', scoreMin.toString());
        return this.http.get<EmployeeMatch[]>(`${this.apiUrl}/matching/project/${projetId}`, { params });
    }

    getMatchDetails(projetId: string, employeId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/matching/project/${projetId}/employee/${employeId}`);
    }

    getMatchingAnalytics(projetId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/matching/project/${projetId}/analytics`);
    }

    // =========================================================
    // GESTION DE L'ÉQUIPE
    // =========================================================

    getEquipeProjet(projetId: string): Observable<MembreEquipe[]> {
        return this.http.get<MembreEquipe[]>(`${this.apiUrl}/projets/${projetId}/equipe`);
    }

    affecterMembre(projetId: string, affectation: AffectationRequest): Observable<MembreEquipe> {
        return this.http.post<MembreEquipe>(`${this.apiUrl}/projets/${projetId}/affecter`, affectation);
    }

    retirerMembre(projetId: string, employeId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/projets/${projetId}/equipe/${employeId}`);
    }

    updateRoleMembre(projetId: string, employeId: string, role: string): Observable<MembreEquipe> {
        return this.http.put<MembreEquipe>(
            `${this.apiUrl}/projets/${projetId}/equipe/${employeId}/role`,
            { roleDansProjet: role }
        );
    }

    // =========================================================
    // MESSAGERIE PROJET
    // =========================================================

    getMessagesProjet(projetId: string): Observable<MessageProjet[]> {
        return this.http.get<MessageProjet[]>(`${this.apiUrl}/messages/projet/${projetId}`);
    }

    envoyerMessage(message: MessageCreate): Observable<MessageProjet> {
        return this.http.post<MessageProjet>(`${this.apiUrl}/messages`, message);
    }

    marquerLu(messageId: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/messages/${messageId}/lu`, {});
    }

    getNombreMessagesNonLus(projetId: string): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/messages/projet/${projetId}/non-lus`);
    }
}
