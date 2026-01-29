import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeKPI, TodoItem, Notification, EmployeeCompetence } from '../models/employee.model';

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
        // TODO: Vérifier si le backend expose ce endpoint, sinon utiliser getMyProfile
        return this.http.get<EmployeeCompetence[]>(`${this.apiUrl}/me/competencies`);
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
     * TODO: Créer l'endpoint backend correspondant
     */
    getKPIs(): Observable<EmployeeKPI> {
        // Pour l'instant, retourner des données mockées
        return new Observable(observer => {
            setTimeout(() => {
                observer.next({
                    niveauGlobalCompetences: 75,
                    competencesValidees: 12,
                    formationsEnCours: 2,
                    projetsActifs: 3
                });
                observer.complete();
            }, 500);
        });
    }

    /**
     * Récupérer les tâches à faire
     * TODO: Créer l'endpoint backend correspondant
     */
    getTodos(): Observable<TodoItem[]> {
        return new Observable(observer => {
            setTimeout(() => {
                observer.next([
                    {
                        id: '1',
                        type: 'EVALUATION',
                        title: 'Auto-évaluation Angular',
                        priority: 'HIGH',
                        dueDate: new Date(Date.now() + 86400000 * 3),
                        status: 'PENDING'
                    },
                    {
                        id: '2',
                        type: 'TEST',
                        title: 'Test technique Java',
                        priority: 'MEDIUM',
                        dueDate: new Date(Date.now() + 86400000 * 7),
                        status: 'PENDING'
                    },
                    {
                        id: '3',
                        type: 'FORMATION',
                        title: 'Formation Spring Boot avancé',
                        priority: 'LOW',
                        status: 'IN_PROGRESS'
                    }
                ]);
                observer.complete();
            }, 500);
        });
    }

    /**
     * Récupérer les notifications
     * TODO: Créer l'endpoint backend correspondant
     */
    getNotifications(): Observable<Notification[]> {
        return new Observable(observer => {
            setTimeout(() => {
                observer.next([
                    {
                        id: '1',
                        type: 'VALIDATION',
                        title: 'Compétence validée',
                        message: 'Votre compétence "Angular" a été validée par votre manager',
                        date: new Date(Date.now() - 3600000),
                        read: false
                    },
                    {
                        id: '2',
                        type: 'AFFECTATION',
                        title: 'Nouveau projet',
                        message: 'Vous avez été affecté au projet "SkillMap"',
                        date: new Date(Date.now() - 86400000),
                        read: false
                    },
                    {
                        id: '3',
                        type: 'FORMATION',
                        title: 'Formation recommandée',
                        message: 'Une nouvelle formation "Docker & Kubernetes" vous est recommandée',
                        date: new Date(Date.now() - 86400000 * 2),
                        read: true
                    }
                ]);
                observer.complete();
            }, 500);
        });
    }
}
