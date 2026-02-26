import { Component, OnInit, signal, computed } from '@angular/core';
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
    // Data Signals
    competencies = signal<EmployeeCompetence[]>([]);
    allCompetencies = signal<{ id: string, nom: string, categorie?: string }[]>([]);
    loading = signal(true);
    showModal = signal(false);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Filter Signals
    searchTerm = signal('');
    selectedCategory = signal('');
    selectedLevel = signal<number | null>(null);

    // Computed: Filtered list
    filteredCompetencies = computed(() => {
        return this.competencies().filter((comp: EmployeeCompetence) => {
            const matchesSearch = comp.competence.nom.toLowerCase().includes(this.searchTerm().toLowerCase());
            const matchesCategory = !this.selectedCategory() || comp.competence.categorie === this.selectedCategory();
            const matchesLevel = !this.selectedLevel() || comp.niveauAuto === this.selectedLevel();
            return matchesSearch && matchesCategory && matchesLevel;
        });
    });

    // Computed: KPIs
    stats = computed(() => {
        const list = this.competencies();
        const validated = list.filter((c: EmployeeCompetence) => !!c.niveauManager).length;
        const average = list.length > 0
            ? (list.reduce((acc: number, curr: EmployeeCompetence) => acc + curr.niveauAuto, 0) / list.length).toFixed(1)
            : '0.0';

        return {
            total: list.length,
            validated: validated,
            pending: list.length - validated,
            average: average
        };
    });

    // Unique categories for the filter
    categories = computed(() => {
        const cats = this.competencies()
            .map((c: EmployeeCompetence) => c.competence.categorie)
            .filter((v: string | undefined, i: number, a: (string | undefined)[]) => !!v && a.indexOf(v) === i);
        return cats as string[];
    });

    // Evaluation Form
    selectedCompetenceId = '';
    isEditMode = false;
    evaluationForm = {
        niveauAuto: 1,
        commentaire: ''
    };

    constructor(private employeeService: EmployeeService) { }

    ngOnInit() {
        this.loadProfile();
        this.loadCompetencies();
        this.loadAllCompetencies();
    }

    loadProfile() {
        if (!this.employeeService.employeeProfile()) {
            this.employeeService.getMyProfile().subscribe();
        }
    }

    loadCompetencies() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.employeeService.getMyCompetencies().subscribe({
            next: (competencies) => {
                this.competencies.set(competencies);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement des compétences:', error);
                this.errorMessage.set('Impossible de charger vos compétences');
                this.loading.set(false);
            }
        });
    }

    loadAllCompetencies() {
        this.employeeService.getAllCompetencies().subscribe({
            next: (competencies) => {
                this.allCompetencies.set(competencies);
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement des compétences disponibles:', error);
            }
        });
    }

    openEvaluationModal(comp?: EmployeeCompetence) {
        this.errorMessage.set(null);
        this.successMessage.set(null);

        if (comp) {
            this.isEditMode = true;
            this.selectedCompetenceId = comp.competence.id;
            this.evaluationForm = {
                niveauAuto: comp.niveauAuto,
                commentaire: comp.commentaire || ''
            };
        } else {
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

    submitEvaluation() {
        if (!this.selectedCompetenceId) {
            this.errorMessage.set('Veuillez sélectionner une compétence');
            return;
        }

        this.employeeService.evaluateCompetence(
            this.selectedCompetenceId,
            this.evaluationForm.niveauAuto,
            this.evaluationForm.commentaire
        ).subscribe({
            next: () => {
                this.successMessage.set(
                    this.isEditMode ? 'Mise à jour réussie' : 'Ajout réussi'
                );
                this.loadCompetencies();
                setTimeout(() => this.closeModal(), 1500);
            },
            error: (error) => {
                this.errorMessage.set(error.error?.message || 'Une erreur est survenue');
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
        return labels[niveau] || 'Inconnu';
    }
}
