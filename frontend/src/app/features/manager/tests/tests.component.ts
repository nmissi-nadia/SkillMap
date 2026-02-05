import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TestAssignment, TestStatut, TechnicalTest } from '../../../core/models/test.model';

@Component({
    selector: 'app-manager-tests',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './tests.component.html',
    styleUrls: ['./tests.component.scss']
})
export class ManagerTestsComponent implements OnInit {
    teamTests = signal<TestAssignment[]>([]);
    loading = signal(true);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Filter
    selectedFilter = signal<'all' | 'assigned' | 'in_progress' | 'completed'>('all');

    // Stats
    stats = signal({
        total: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        averageScore: 0
    });

    ngOnInit() {
        this.loadTests();
    }

    loadTests() {
        this.loading.set(true);
        this.errorMessage.set(null);

        // TODO: Replace with actual API call
        // Simulated data for now
        setTimeout(() => {
            const mockTests: TestAssignment[] = [
                {
                    id: '1',
                    testId: 't1',
                    test: {
                        id: 't1',
                        titre: 'Test Technique Angular',
                        description: 'Évaluation des compétences Angular avancées',
                        type: 'TECHNIQUE' as any,
                        duree: 60,
                        difficulte: 'MOYEN' as any,
                        competences: ['Angular', 'TypeScript', 'RxJS'],
                        dateCreation: new Date()
                    },
                    employeId: 'emp1',
                    employeNom: 'Martin',
                    employePrenom: 'Jean',
                    managerId: 'mgr1',
                    statut: 'ASSIGNE' as TestStatut,
                    dateAssignation: new Date('2026-02-01'),
                    dateLimite: new Date('2026-02-10')
                },
                {
                    id: '2',
                    testId: 't2',
                    test: {
                        id: 't2',
                        titre: 'Test Java/Spring Boot',
                        description: 'Évaluation des compétences backend Java',
                        type: 'TECHNIQUE' as any,
                        duree: 90,
                        difficulte: 'DIFFICILE' as any,
                        competences: ['Java', 'Spring Boot', 'JPA'],
                        dateCreation: new Date()
                    },
                    employeId: 'emp2',
                    employeNom: 'Dubois',
                    employePrenom: 'Sophie',
                    managerId: 'mgr1',
                    statut: 'EN_COURS' as TestStatut,
                    dateAssignation: new Date('2026-01-25'),
                    dateLimite: new Date('2026-02-05'),
                    dateDebut: new Date('2026-02-03')
                },
                {
                    id: '3',
                    testId: 't3',
                    test: {
                        id: 't3',
                        titre: 'Test Architecture Logicielle',
                        description: 'Évaluation des connaissances en architecture',
                        type: 'TECHNIQUE' as any,
                        duree: 45,
                        difficulte: 'MOYEN' as any,
                        competences: ['Architecture', 'Design Patterns'],
                        dateCreation: new Date()
                    },
                    employeId: 'emp3',
                    employeNom: 'Leroy',
                    employePrenom: 'Pierre',
                    managerId: 'mgr1',
                    statut: 'TERMINE' as TestStatut,
                    dateAssignation: new Date('2026-01-15'),
                    dateLimite: new Date('2026-01-25'),
                    dateDebut: new Date('2026-01-20'),
                    dateFin: new Date('2026-01-20'),
                    score: 85
                },
                {
                    id: '4',
                    testId: 't1',
                    test: {
                        id: 't1',
                        titre: 'Test Technique Angular',
                        description: 'Évaluation des compétences Angular avancées',
                        type: 'TECHNIQUE' as any,
                        duree: 60,
                        difficulte: 'MOYEN' as any,
                        competences: ['Angular', 'TypeScript', 'RxJS'],
                        dateCreation: new Date()
                    },
                    employeId: 'emp2',
                    employeNom: 'Dubois',
                    employePrenom: 'Sophie',
                    managerId: 'mgr1',
                    statut: 'TERMINE' as TestStatut,
                    dateAssignation: new Date('2026-01-10'),
                    dateLimite: new Date('2026-01-20'),
                    dateDebut: new Date('2026-01-15'),
                    dateFin: new Date('2026-01-15'),
                    score: 92
                }
            ];

            this.teamTests.set(mockTests);
            this.calculateStats(mockTests);
            this.loading.set(false);
        }, 1000);
    }

    calculateStats(tests: TestAssignment[]) {
        const assigned = tests.filter(t => t.statut === 'ASSIGNE').length;
        const inProgress = tests.filter(t => t.statut === 'EN_COURS').length;
        const completed = tests.filter(t => t.statut === 'TERMINE' || t.statut === 'EVALUE').length;

        const completedTests = tests.filter(t => t.score !== undefined);
        const averageScore = completedTests.length > 0
            ? Math.round(completedTests.reduce((sum, t) => sum + (t.score || 0), 0) / completedTests.length)
            : 0;

        this.stats.set({
            total: tests.length,
            assigned,
            inProgress,
            completed,
            averageScore
        });
    }

    get filteredTests() {
        const filter = this.selectedFilter();
        const tests = this.teamTests();

        switch (filter) {
            case 'assigned':
                return tests.filter(t => t.statut === 'ASSIGNE');
            case 'in_progress':
                return tests.filter(t => t.statut === 'EN_COURS');
            case 'completed':
                return tests.filter(t => t.statut === 'TERMINE' || t.statut === 'EVALUE');
            default:
                return tests;
        }
    }

    getStatutLabel(statut: TestStatut): string {
        const labels = {
            'ASSIGNE': 'Assigné',
            'EN_COURS': 'En cours',
            'TERMINE': 'Terminé',
            'EVALUE': 'Évalué'
        };
        return labels[statut] || statut;
    }

    getStatutClass(statut: TestStatut): string {
        const classes = {
            'ASSIGNE': 'badge-warning',
            'EN_COURS': 'badge-info',
            'TERMINE': 'badge-success',
            'EVALUE': 'badge-success'
        };
        return classes[statut] || 'badge-secondary';
    }

    viewTestDetails(assignment: TestAssignment) {
        console.log('📊 Viewing test details:', assignment);
        // TODO: Navigate to test details page
        alert(`Détails du test pour ${assignment.employePrenom} ${assignment.employeNom}\n\nCette fonctionnalité sera implémentée prochainement.`);
    }

    sendReminder(assignment: TestAssignment) {
        console.log('📧 Sending reminder to:', assignment.employePrenom, assignment.employeNom);
        this.successMessage.set(`Rappel envoyé à ${assignment.employePrenom} ${assignment.employeNom}`);
        setTimeout(() => this.successMessage.set(null), 5000);
    }

    getDaysRemaining(dateLimite: Date): number {
        const today = new Date();
        const limit = new Date(dateLimite);
        const diffTime = limit.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    isOverdue(dateLimite: Date, statut: TestStatut): boolean {
        return this.getDaysRemaining(dateLimite) < 0 && (statut === 'ASSIGNE' || statut === 'EN_COURS');
    }
}
