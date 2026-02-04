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
    showModal = signal(false);
    selectedEvaluation = signal<PendingEvaluation | null>(null);
    niveauManager = signal(0);
    commentaireManager = signal('');

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
                this.loading.set(false);
                console.log('✅ Évaluations en attente chargées:', evaluations);
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement des évaluations:', error);
                this.errorMessage.set('Impossible de charger les évaluations');
                this.loading.set(false);
            }
        });
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
                console.error('❌ Erreur lors de la validation:', error);
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

    getStars(niveau: number): string[] {
        return Array(5).fill('').map((_, i) => i < niveau ? '★' : '☆');
    }
}
