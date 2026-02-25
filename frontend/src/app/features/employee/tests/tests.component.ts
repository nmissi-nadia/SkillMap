import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TestAssignment, TestStatut } from '../../../core/models/test.model';

@Component({
    selector: 'app-employee-tests',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './tests.component.html',
    styleUrls: ['./tests.component.scss']
})
export class EmployeeTestsComponent implements OnInit {
    assignedTests = signal<TestAssignment[]>([]);
    loading = signal(true);
    errorMessage = signal<string | null>(null);

    // Filter
    selectedFilter = signal<'all' | 'assigned' | 'in_progress' | 'completed'>('all');

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
                    employeNom: 'Dupont',
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
                    employeId: 'emp1',
                    employeNom: 'Dupont',
                    employePrenom: 'Jean',
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
                    employeId: 'emp1',
                    employeNom: 'Dupont',
                    employePrenom: 'Jean',
                    managerId: 'mgr1',
                    statut: 'TERMINE' as TestStatut,
                    dateAssignation: new Date('2026-01-15'),
                    dateLimite: new Date('2026-01-25'),
                    dateDebut: new Date('2026-01-20'),
                    dateFin: new Date('2026-01-20'),
                    score: 85
                }
            ];

            this.assignedTests.set(mockTests);
            this.loading.set(false);
        }, 1000);
    }

    get filteredTests() {
        const filter = this.selectedFilter();
        const tests = this.assignedTests();

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
            'ASSIGNE': 'À faire',
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

    getDifficulteLabel(difficulte: string): string {
        const labels: { [key: string]: string } = {
            'FACILE': 'Facile',
            'MOYEN': 'Moyen',
            'DIFFICILE': 'Difficile'
        };
        return labels[difficulte] || difficulte;
    }

    getDifficulteClass(difficulte: string): string {
        const classes: { [key: string]: string } = {
            'FACILE': 'badge-success',
            'MOYEN': 'badge-warning',
            'DIFFICILE': 'badge-error'
        };
        return classes[difficulte] || 'badge-secondary';
    }

    startTest(assignment: TestAssignment) {
        console.log('🚀 Starting test:', assignment.test.titre);
        // TODO: Navigate to test taking page
        alert(`Démarrage du test: ${assignment.test.titre}\n\nCette fonctionnalité sera implémentée prochainement.`);
    }

    continueTest(assignment: TestAssignment) {
        console.log('▶️ Continuing test:', assignment.test.titre);
        // TODO: Navigate to test taking page with saved progress
        alert(`Reprise du test: ${assignment.test.titre}\n\nCette fonctionnalité sera implémentée prochainement.`);
    }

    viewResults(assignment: TestAssignment) {
        console.log('📊 Viewing results:', assignment.test.titre);
        // TODO: Navigate to results page
        alert(`Résultats du test: ${assignment.test.titre}\nScore: ${assignment.score}%\n\nCette fonctionnalité sera implémentée prochainement.`);
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
