import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee } from '../models/employee.model';
import { TeamStats, PendingEvaluation, ValidationRequest, TestAssignment, ManagerDashboard } from '../models/manager.model';

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
        return this.http.get<TestAssignment[]>(`${this.apiUrl}/me/tests/assigned`);
    }

    /**
     * Récupérer les résultats d'un test
     */
    getTestResults(testId: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/tests/${testId}/results`);
    }

    // ========== Projets ==========

    /**
     * Récupérer les projets du manager
     */
    getMyProjects(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/me/projects`);
    }

    /**
     * Proposer un employé pour un projet
     */
    proposeEmployeeForProject(projectId: string, proposal: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/projets/${projectId}/propose-employee`, proposal);
    }

    /**
     * Récupérer les manques de compétences d'un projet
     */
    getProjectSkillGaps(projectId: string): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/projets/${projectId}/skill-gaps`);
    }

    // ========== Dashboard ==========

    /**
     * Récupérer les données du dashboard manager
     */
    getDashboard(): Observable<ManagerDashboard> {
        return this.http.get<ManagerDashboard>(`${this.apiUrl}/me/dashboard`);
    }
}
