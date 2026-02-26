import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';
import { PendingEvaluation, ValidationRequest } from '../../../core/models/manager.model';

@Component({
    selector: 'app-pending-evaluations',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './pending-evaluations.component.html',
    styleUrls: ['./pending-evaluations.component.scss']
})
export class PendingEvaluationsComponent implements OnInit {
    evaluations = signal<PendingEvaluation[]>([]);
    loading = signal(true);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Modal state
    selectedEvaluation = signal<PendingEvaluation | null>(null);
    niveauManager = signal(0);
    commentaireManager = signal('');

    // Filter and search
    selectedFilter = signal<'all' | 'high' | 'medium' | 'low'>('all');
    searchQuery = signal('');

    // Statistics
    stats = signal({
        total: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        averageLevel: 0
    });

    showModal = signal(false);

    constructor(private managerService: ManagerService) { }

    ngOnInit() {
        this.loadPendingEvaluations();
    }

    loadPendingEvaluations() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.managerService.getPendingEvaluations().subscribe({
            next: (evaluations) => {
                this.evaluations.set(evaluations);
                this.calculateStats(evaluations);
                this.loading.set(false);
                console.log('Évaluations en attente chargées:', evaluations);
            },
            error: (error) => {
                console.error('Erreur lors du chargement des évaluations:', error);
                this.errorMessage.set('Impossible de charger les évaluations');
                this.loading.set(false);
            }
        });
    }

    calculateStats(evaluations: PendingEvaluation[]) {
        const total = evaluations.length;
        const highPriority = evaluations.filter(e => e.niveauAuto >= 4).length;
        const mediumPriority = evaluations.filter(e => e.niveauAuto === 3).length;
        const lowPriority = evaluations.filter(e => e.niveauAuto <= 2).length;
        const averageLevel = total > 0
            ? Math.round(evaluations.reduce((sum, e) => sum + e.niveauAuto, 0) / total * 10) / 10
            : 0;

        this.stats.set({
            total,
            highPriority,
            mediumPriority,
            lowPriority,
            averageLevel
        });
    }

    get filteredEvaluations() {
        let filtered = this.evaluations();

        // Apply filter
        const filter = this.selectedFilter();
        if (filter === 'high') {
            filtered = filtered.filter(e => e.niveauAuto >= 4);
        } else if (filter === 'medium') {
            filtered = filtered.filter(e => e.niveauAuto === 3);
        } else if (filter === 'low') {
            filtered = filtered.filter(e => e.niveauAuto <= 2);
        }

        // Apply search
        const query = this.searchQuery().toLowerCase();
        if (query) {
            filtered = filtered.filter(e =>
                e.employe.nom.toLowerCase().includes(query) ||
                e.employe.prenom.toLowerCase().includes(query) ||
                e.competence.nom.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    openValidationModal(evaluation: PendingEvaluation) {
        this.selectedEvaluation.set(evaluation);
        this.niveauManager.set(evaluation.niveauAuto); // Pré-remplir avec le niveau auto
        this.commentaireManager.set('');
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
        this.selectedEvaluation.set(null);
        this.niveauManager.set(0);
        this.commentaireManager.set('');
    }

    validateEvaluation(valide: boolean) {
        const evaluation = this.selectedEvaluation();
        if (!evaluation) return;

        const validation: ValidationRequest = {
            niveauManager: this.niveauManager(),
            commentaireManager: this.commentaireManager(),
            valide
        };

        this.managerService.validateEvaluation(evaluation.id, validation).subscribe({
            next: () => {
                this.successMessage.set(`Évaluation ${valide ? 'validée' : 'ajustée'} avec succès`);
                this.closeModal();
                this.loadPendingEvaluations(); // Recharger la liste

                // Auto-hide success message
                setTimeout(() => this.successMessage.set(null), 3000);
            },
            error: (error) => {
                console.error('Erreur lors de la validation:', error);
                this.errorMessage.set('Erreur lors de la validation');
            }
        });
    }

    getNiveauLabel(niveau: number): string {
        const labels: { [key: number]: string } = {
            1: 'Débutant',
            2: 'Notions',
            3: 'Autonome',
            4: 'Maîtrise',
            5: 'Expert'
        };
        return labels[niveau] || 'Non défini';
    }


    getPriorityClass(niveau: number): string {
        if (niveau >= 4) return 'priority-high';
        if (niveau === 3) return 'priority-medium';
        return 'priority-low';
    }

    getPriorityLabel(niveau: number): string {
        if (niveau >= 4) return 'Haute';
        if (niveau === 3) return 'Moyenne';
        return 'Basse';
    }

    formatDate(dateInput: Date | string): string {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }
}
