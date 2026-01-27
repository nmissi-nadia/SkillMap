import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employe, EmployeDTO } from '../models/employe.model';

/**
 * Service pour gérer les employés
 */
@Injectable({
    providedIn: 'root'
})
export class EmployeService {
    private http = inject(HttpClient);
    private apiUrl = '/api/employes';

    /**
     * Récupérer tous les employés
     */
    getAll(): Observable<Employe[]> {
        return this.http.get<Employe[]>(this.apiUrl);
    }

    /**
     * Récupérer un employé par son ID
     */
    getById(id: number): Observable<Employe> {
        return this.http.get<Employe>(`${this.apiUrl}/${id}`);
    }

    /**
     * Créer un nouveau employé
     */
    create(employe: EmployeDTO): Observable<Employe> {
        return this.http.post<Employe>(this.apiUrl, employe);
    }

    /**
     * Mettre à jour un employé existant
     */
    update(id: number, employe: EmployeDTO): Observable<Employe> {
        return this.http.put<Employe>(`${this.apiUrl}/${id}`, employe);
    }

    /**
     * Supprimer un employé
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
