import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';
import { TestAssignment, TestStatut } from '../../../core/models/test.model';

@Component({
    selector: 'app-manager-tests',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './tests.component.html',
    styleUrls: ['./tests.component.scss']
})
export class ManagerTestsComponent implements OnInit {
    private managerService = inject(ManagerService);

    teamTests = signal<TestAssignment[]>([]);
    loading = signal(true);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Filter
    selectedFilter = signal<'all' | 'assigned' | 'in_progress' | 'completed'>('all');

    // Stats calculées via computed signal
    stats = computed(() => {
        const tests = this.teamTests();
        const assigned = tests.filter(t => t.statut === 'ASSIGNE').length;
        const inProgress = tests.filter(t => t.statut === 'EN_COURS').length;
        const completed = tests.filter(t => t.statut === 'TERMINE' || t.statut === 'EVALUE').length;

        const completedTests = tests.filter(t => t.score !== undefined);
        const averageScore = completedTests.length > 0
            ? Math.round(completedTests.reduce((sum, t) => sum + (t.score || 0), 0) / completedTests.length)
            : 0;

        return {
            total: tests.length,
            assigned,
            inProgress,
            completed,
            averageScore
        };
    });

    ngOnInit() {
        this.loadTests();
    }

    loadTests() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.managerService.getAssignedTests().subscribe({
            next: (tests) => {
                this.teamTests.set(tests);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement tests manager:', err);
                this.errorMessage.set('Impossible de charger les tests de l\'équipe.');
                this.loading.set(false);
            }
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
        const labels: Record<string, string> = {
            'ASSIGNE': 'Assigné',
            'EN_COURS': 'En cours',
            'TERMINE': 'Terminé',
            'EVALUE': 'Évalué'
        };
        return labels[statut] || statut;
    }

    getStatutClass(statut: TestStatut): string {
        switch (statut) {
            case 'ASSIGNE': return 'badge-warning';
            case 'EN_COURS': return 'badge-info';
            case 'TERMINE':
            case 'EVALUE': return 'badge-success';
            default: return 'badge-secondary';
        }
    }

    getDifficulteLabel(difficulte: string): string {
        const labels: Record<string, string> = {
            'FACILE': 'Facile',
            'MOYEN': 'Moyen',
            'DIFFICILE': 'Difficile'
        };
        return labels[difficulte] || difficulte;
    }

    viewTestDetails(assignment: TestAssignment) {
        alert(`Détails du test pour ${assignment.employePrenom} ${assignment.employeNom}\nTest: ${assignment.test.titre}\nScore: ${assignment.score !== undefined ? assignment.score + '%' : 'En attente'}`);
    }

    sendReminder(assignment: TestAssignment) {
        this.successMessage.set(`Rappel envoyé à ${assignment.employePrenom} ${assignment.employeNom}`);
        setTimeout(() => this.successMessage.set(null), 5000);
    }

    getDaysRemaining(dateLimite: Date): number {
        const today = new Date();
        const limit = new Date(dateLimite);
        const diffTime = limit.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    isOverdue(dateLimite: Date, statut: TestStatut): boolean {
        return this.getDaysRemaining(dateLimite) < 0 && (statut === 'ASSIGNE' || statut === 'EN_COURS');
    }
}
