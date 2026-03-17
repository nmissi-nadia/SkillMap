import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    CreateFormationRequestDTO,
    CreateRessourceDTO,
    FormationDetailDTO,
    InscriptionDTO,
    RessourceFormationDTO
} from '../models/formation.model';

@Injectable({
    providedIn: 'root'
})
export class FormationService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    getAllFormations(): Observable<FormationDetailDTO[]> {
        return this.http.get<FormationDetailDTO[]>(`${this.apiUrl}/formations`);
    }

    getFormationById(id: string): Observable<FormationDetailDTO> {
        return this.http.get<FormationDetailDTO>(`${this.apiUrl}/formations/${id}`);
    }

    createFormation(dto: CreateFormationRequestDTO): Observable<FormationDetailDTO> {
        return this.http.post<FormationDetailDTO>(`${this.apiUrl}/formations`, dto);
    }

    addResourceToFormation(formationId: string, dto: CreateRessourceDTO): Observable<RessourceFormationDTO> {
        return this.http.post<RessourceFormationDTO>(`${this.apiUrl}/formations/${formationId}/ressources`, dto);
    }

    assignFormationToEmployee(formationId: string, employeeId: string): Observable<InscriptionDTO> {
        return this.http.post<InscriptionDTO>(`${this.apiUrl}/formations/${formationId}/inscriptions/${employeeId}`, {});
    }

    getEmployeeFormations(employeeId: string): Observable<FormationDetailDTO[]> {
        return this.http.get<FormationDetailDTO[]>(`${this.apiUrl}/employes/${employeeId}/formations`);
    }
}
