import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Employee } from '../models/employee.model';
import { TeamStats, PendingEvaluation, ValidationRequest, ManagerDashboard } from '../models/manager.model';
import { TestAssignment, TestStatut } from '../models/test.model';

/**
 * Service pour gérer les fonctionnalités du manager
 */
@Injectable({
    providedIn: 'root'
})
export class ManagerService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/managers`;

    // ========== Gestion de l'équipe ==========

    /**
     * Récupérer la liste des employés de l'équipe
     */
    getMyTeam(): Observable<Employee[]> {
        return this.http.get<Employee[]>(`${this.apiUrl}/me/team`);
    }

    /**
     * Récupérer les statistiques de l'équipe
     */
    getTeamStats(): Observable<TeamStats> {
        return this.http.get<TeamStats>(`${this.apiUrl}/me/team/stats`);
    }

    /**
     * Récupérer les détails d'un membre de l'équipe
     */
    getTeamMemberDetails(employeeId: string): Observable<Employee> {
        return this.http.get<Employee>(`${this.apiUrl}/me/team/${employeeId}`);
    }

    /**
     * Récupérer les employés sans manager (disponibles pour l'équipe)
     */
    getAvailableEmployees(): Observable<Employee[]> {
        return this.http.get<Employee[]>(`${this.apiUrl}/me/available-employes`);
    }

    /**
     * Assigner un employé à son équipe
     */
    assignEmployeeToTeam(employeeId: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/me/team/assign/${employeeId}`, {});
    }

    // ========== Évaluation des compétences ==========

    /**
     * Récupérer les évaluations en attente de validation
     */
    getPendingEvaluations(): Observable<PendingEvaluation[]> {
        return this.http.get<PendingEvaluation[]>(`${this.apiUrl}/me/evaluations/pending`);
    }

    /**
     * Valider une évaluation de compétence
     */
    validateEvaluation(evaluationId: string, validation: ValidationRequest): Observable<any> {
        return this.http.put(`${environment.apiUrl}/evaluations/competences/${evaluationId}/validate`, validation);
    }

    /**
     * Récupérer l'historique des évaluations d'un employé
     */
    getEvaluationHistory(employeeId: string): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/evaluations/competences/${employeeId}/history`);
    }

    // ========== Tests techniques ==========

    /**
     * Assigner un test à un employé
     */
    assignTest(assignment: any): Observable<TestAssignment> {
        return this.http.post<TestAssignment>(`${environment.apiUrl}/tests/assign`, assignment);
    }

    /**
     * Récupérer les tests assignés par le manager
     */
    getAssignedTests(): Observable<TestAssignment[]> {
        return this.http.get<any[]>(`${this.apiUrl}/me/tests/assigned`).pipe(
            map((dtos: any[]) => dtos.map((dto: any) => ({
                id: dto.id,
                testId: dto.testId,
                employeId: dto.employeId,
                employeNom: dto.employeNom,
                employePrenom: dto.employePrenom,
                managerId: dto.managerId,
                statut: dto.statut,
                score: dto.score,
                dateAssignation: new Date(dto.dateAssignation),
                dateLimite: dto.dateLimite ? new Date(dto.dateLimite) : undefined,
                test: {
                    id: dto.testId,
                    titre: dto.testTitre,
                    technologie: dto.technologie,
                    // Valeurs par défaut pour le reste
                    description: '',
                    type: 'TECHNIQUE' as any,
                    duree: 0,
                    difficulte: 'MOYEN' as any,
                    competences: [],
                    dateCreation: new Date()
                }
            } as TestAssignment)))
        );
    }

    /**
     * Récupérer les résultats d'un test
     */
    getTestResults(testId: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/tests/${testId}/results`);
    }

    // ========== Dashboard ==========

    /**
     * Récupérer les données du dashboard manager
     */
    getDashboard(): Observable<ManagerDashboard> {
        return this.http.get<ManagerDashboard>(`${this.apiUrl}/me/dashboard`);
    }

    /**
     * Récupérer tous les tests disponibles dans le système
     */
    getAllAvailableTests(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/tests`);
    }

    /**
     * Récupérer toutes les compétences disponibles dans le système
     */
    getAllAvailableCompetencies(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/competencies`);
    }
}
