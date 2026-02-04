
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeCompetence } from '../../../core/models/employee.model';

@Component({
    selector: 'app-employee-competencies',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './competencies.component.html',
    styleUrls: ['./competencies.component.scss']
})
export class CompetenciesComponent implements OnInit {
    competencies = signal<EmployeeCompetence[]>([]);
    loading = signal(true);
    showModal = signal(false);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Evaluation Form
    selectedCompetenceId = '';
    isEditMode = false; // true si on modifie une compétence existante
    evaluationForm = {
        niveauAuto: 1,
        commentaire: ''
    };

    // Liste de toutes les compétences disponibles dans le système
    allCompetencies: { id: string, nom: string, categorie?: string }[] = [];

    constructor(private employeeService: EmployeeService) { }

    ngOnInit() {
        this.loadCompetencies();
        this.loadAllCompetencies();
    }

    /**
     * Charger les compétences de l'employé
     */
    loadCompetencies() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.employeeService.getMyCompetencies().subscribe({
            next: (competencies) => {
                this.competencies.set(competencies);
                this.loading.set(false);
                console.log('✅ Compétences chargées:', competencies);
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement des compétences:', error);
                this.errorMessage.set('Impossible de charger vos compétences');
                this.loading.set(false);
            }
        });
    }

    /**
     * Charger toutes les compétences disponibles dans le système
     * Pour permettre à l'employé de choisir lesquelles ajouter
     */
    loadAllCompetencies() {
        this.employeeService.getAllCompetencies().subscribe({
            next: (competencies) => {
                this.allCompetencies = competencies;
                console.log('✅ Toutes les compétences disponibles:', competencies);
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement des compétences disponibles:', error);
                // Fallback: utiliser une liste vide, l'employé ne pourra pas ajouter de nouvelles compétences
                this.allCompetencies = [];
            }
        });
    }

    /**
     * Ouvrir le modal pour ajouter ou modifier une compétence
     */
    openEvaluationModal(comp?: EmployeeCompetence) {
        this.errorMessage.set(null);
        this.successMessage.set(null);

        if (comp) {
            // Mode édition: modifier une compétence existante
            this.isEditMode = true;
            this.selectedCompetenceId = comp.competence.id;
            this.evaluationForm = {
                niveauAuto: comp.niveauAuto,
                commentaire: comp.commentaire || ''
            };
        } else {
            // Mode création: ajouter une nouvelle compétence
            this.isEditMode = false;
            this.selectedCompetenceId = '';
            this.evaluationForm = {
                niveauAuto: 1,
                commentaire: ''
            };
        }
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
        this.errorMessage.set(null);
        this.successMessage.set(null);
    }

    /**
     * Soumettre l'auto-évaluation (création ou modification)
     */
    submitEvaluation() {
        if (!this.selectedCompetenceId) {
            this.errorMessage.set('Veuillez sélectionner une compétence');
            return;
        }

        this.errorMessage.set(null);
        console.log('📝 Soumission évaluation:', {
            competenceId: this.selectedCompetenceId,
            niveau: this.evaluationForm.niveauAuto,
            commentaire: this.evaluationForm.commentaire
        });

        this.employeeService.evaluateCompetence(
            this.selectedCompetenceId,
            this.evaluationForm.niveauAuto,
            this.evaluationForm.commentaire
        ).subscribe({
            next: (result) => {
                console.log('✅ Évaluation enregistrée:', result);
                this.successMessage.set(
                    this.isEditMode
                        ? 'Compétence mise à jour avec succès'
                        : 'Compétence ajoutée avec succès'
                );

                // Recharger les compétences
                this.loadCompetencies();

                // Fermer le modal après un court délai
                setTimeout(() => {
                    this.closeModal();
                }, 1500);
            },
            error: (error) => {
                console.error('❌ Erreur lors de l\'enregistrement:', error);
                this.errorMessage.set(
                    error.error?.message || 'Une erreur est survenue lors de l\'enregistrement'
                );
            }
        });
    }

    /**
     * Obtenir le label du niveau de compétence
     */
    getNiveauLabel(niveau: number): string {
        const labels: { [key: number]: string } = {
            1: 'Débutant',
            2: 'Notions',
            3: 'Autonome',
            4: 'Maîtrise',
            5: 'Expert'
        };
        return labels[niveau] || 'Inconnu';
    }
}
