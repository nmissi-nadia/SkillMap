import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeKPI, TodoItem, Notification } from '../models/employee.model';
import { EmployeeCompetence } from '../models/employee.model';

/**
 * Service pour gérer les données de l'employé
 */
@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/employes`;

    // Signal pour le profil de l'employé
    employeeProfile = signal<Employee | null>(null);

    /**
     * Récupérer le profil de l'employé connecté
     */
    getMyProfile(): Observable<Employee> {
        return this.http.get<Employee>(`${this.apiUrl}/me`)
            .pipe(
                tap(profile => this.employeeProfile.set(profile))
            );
    }

    /**
     * Récupérer le profil d'un employé spécifique (pour les managers/RH)
     */
    getEmployeeById(id: string): Observable<Employee> {
        return this.http.get<Employee>(`${this.apiUrl}/${id}`);
    }

    /**
     * Mettre à jour son propre profil
     */
    updateMyProfile(data: Partial<Employee>): Observable<Employee> {
        return this.http.put<Employee>(`${this.apiUrl}/me`, data)
            .pipe(
                tap(profile => this.employeeProfile.set(profile))
            );
    }

    /**
     * Récupérer les compétences de l'employé
     */
    getMyCompetencies(): Observable<EmployeeCompetence[]> {
        return this.http.get<EmployeeCompetence[]>(`${this.apiUrl}/me/competences`);
    }

    /**
     * Récupérer l'historique des évaluations d'un employé spécifique
     */
    getEvaluationHistory(employeId: string): Observable<EmployeeCompetence[]> {
        return this.http.get<EmployeeCompetence[]>(`${environment.apiUrl}/evaluations/competences/${employeId}/history`);
    }

    /**
     * Récupérer toutes les compétences disponibles dans le système
     * Pour que l'employé puisse choisir lesquelles ajouter à son profil
     */
    getAllCompetencies(): Observable<{ id: string, nom: string, categorie?: string }[]> {
        return this.http.get<{ id: string, nom: string, categorie?: string }[]>(`${environment.apiUrl}/competencies`);
    }

    /**
     * Auto-évaluer une compétence
     */
    evaluateCompetence(competenceId: string, niveau: number, commentaire: string): Observable<EmployeeCompetence> {
        const employeId = this.employeeProfile()?.id;
        if (!employeId) throw new Error("Profil non chargé");

        return this.http.post<EmployeeCompetence>(`${environment.apiUrl}/evaluations/competences/auto/${employeId}`, {
            competenceId,
            niveauAuto: niveau,
            commentaire
        });
    }

    /**
     * Récupérer les KPIs du dashboard
     */
    getKPIs(): Observable<EmployeeKPI> {
        return this.http.get<EmployeeKPI>(`${this.apiUrl}/me/kpis`);
    }

    /**
     * Récupérer les tâches à faire
     */
    getTodos(): Observable<TodoItem[]> {
        return this.http.get<TodoItem[]>(`${this.apiUrl}/me/todos`);
    }

    /**
     * Récupérer les tests techniques actifs pour l'employé
     */
    getActiveTests(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/tests/active`);
    }

    /**
     * Récupérer les formations de l'employé
     */
    getMyFormations(): Observable<any[]> {
        // Pour l'instant on utilise l'endpoint RH ou on simule si nécessaire
        // Idéalement il faudrait un endpoint /api/employes/me/formations
        return this.http.get<any[]>(`${environment.apiUrl}/rh/formations`);
    }

    /**
     * S'inscrire à une formation
     */
    registerToFormation(formationId: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/rh/formations/assign`, {
            formationId,
            employeIds: [this.employeeProfile()?.id]
        });
    }

    /**
     * Récupérer les notifications
     */
    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/me/notifications`);
    }
}
