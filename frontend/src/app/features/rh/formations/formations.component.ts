import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RhService, FormationDTO, FormationBudgetDTO, PageResponse } from '../../../core/services/rh.service';

@Component({
    selector: 'app-formations',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './formations.component.html',
    styleUrls: ['./formations.component.css']
})
export class FormationsComponent implements OnInit {
    formations = signal<FormationDTO[]>([]);
    selectedFormation = signal<FormationDTO | null>(null);
    formationBudget = signal<FormationBudgetDTO | null>(null);

    // Pagination
    currentPage = signal(0);
    pageSize = signal(10);
    totalElements = signal(0);
    totalPages = signal(0);

    // UI States
    isLoading = signal(true);
    isLoadingBudget = signal(false);
    error = signal<string | null>(null);
    showBudgetModal = signal(false);
    showFormModal = signal(false);
    isEditing = signal(false);
    isSaving = signal(false);

    editForm: any = {
        titre: '',
        organisme: '',
        type: 'Interne',
        description: '',
        dateDebut: '',
        dateFin: '',
        cout: 0,
        maxParticipants: 10
    };

    constructor(private rhService: RhService) { }

    ngOnInit(): void {
        this.loadFormations();
    }

    loadFormations(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.rhService.getAllFormations(this.currentPage(), this.pageSize()).subscribe({
            next: (response: PageResponse<FormationDTO>) => {
                this.formations.set(response.content);
                this.totalElements.set(response.totalElements);
                this.totalPages.set(response.totalPages);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement formations:', err);
                this.error.set('Erreur lors du chargement des formations');
                this.isLoading.set(false);
            }
        });
    }

    viewBudgetDetails(formation: FormationDTO): void {
        this.selectedFormation.set(formation);
        this.isLoadingBudget.set(true);
        this.showBudgetModal.set(true);

        this.rhService.getFormationBudget(formation.id).subscribe({
            next: (budget) => {
                this.formationBudget.set(budget);
                this.isLoadingBudget.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement budget:', err);
                this.isLoadingBudget.set(false);
            }
        });
    }

    closeBudgetModal(): void {
        this.showBudgetModal.set(false);
        this.selectedFormation.set(null);
        this.formationBudget.set(null);
    }

    nextPage(): void {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadFormations();
        }
    }

    previousPage(): void {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadFormations();
        }
    }

    goToPage(page: number): void {
        this.currentPage.set(page);
        this.loadFormations();
    }

    getPageNumbers(): number[] {
        const total = this.totalPages();
        const current = this.currentPage();
        const pages: number[] = [];

        // Afficher max 5 pages
        let start = Math.max(0, current - 2);
        let end = Math.min(total, start + 5);

        if (end - start < 5) {
            start = Math.max(0, end - 5);
        }

        for (let i = start; i < end; i++) {
            pages.push(i);
        }

        return pages;
    }

    getStatutColor(statut: string): string {
        switch (statut.toUpperCase()) {
            case 'PLANIFIÉE':
            case 'PLANIFIEE':
                return '#3b82f6';
            case 'EN_COURS':
                return '#f59e0b';
            case 'TERMINÉE':
            case 'TERMINEE':
                return '#10b981';
            case 'ANNULÉE':
            case 'ANNULEE':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    }

    getStatutLabel(statut: string): string {
        switch (statut.toUpperCase()) {
            case 'PLANIFIÉE':
            case 'PLANIFIEE':
                return 'Planifiée';
            case 'EN_COURS':
                return 'En cours';
            case 'TERMINÉE':
            case 'TERMINEE':
                return 'Terminée';
            case 'ANNULÉE':
            case 'ANNULEE':
                return 'Annulée';
            default:
                return statut;
        }
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'Non définie';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // ========== CRUD Logic ==========

    openCreateModal(): void {
        this.isEditing.set(false);
        this.editForm = {
            titre: '',
            organisme: '',
            type: 'Interne',
            description: '',
            dateDebut: '',
            dateFin: '',
            cout: 0,
            maxParticipants: 10
        };
        this.showFormModal.set(true);
    }

    openEditModal(formation: FormationDTO): void {
        this.isEditing.set(true);
        this.selectedFormation.set(formation);
        this.editForm = {
            titre: formation.titre,
            organisme: formation.organisme || '',
            type: formation.type || 'Interne',
            description: formation.description || '',
            dateDebut: formation.dateDebut ? formation.dateDebut.substring(0, 10) : '',
            dateFin: formation.dateFin ? formation.dateFin.substring(0, 10) : '',
            cout: formation.cout || 0,
            maxParticipants: formation.maxParticipants || 10
        };
        this.showFormModal.set(true);
    }

    closeFormModal(): void {
        this.showFormModal.set(false);
        this.isSaving.set(false);
    }

    saveFormation(): void {
        if (!this.editForm.titre || !this.editForm.dateDebut || !this.editForm.organisme) {
            this.error.set('Veuillez remplir les champs obligatoires (*)');
            return;
        }

        this.isSaving.set(true);
        const obs = this.isEditing() && this.selectedFormation()
            ? this.rhService.updateFormation(this.selectedFormation()!.id, this.editForm)
            : this.rhService.createFormation(this.editForm);

        obs.subscribe({
            next: () => {
                this.loadFormations();
                this.closeFormModal();
            },
            error: (err) => {
                console.error('Erreur sauvegarde formation:', err);
                this.error.set('Erreur lors de l\'enregistrement de la formation');
                this.isSaving.set(false);
            }
        });
    }

    confirmDelete(formation: FormationDTO): void {
        if (confirm(`Voulez-vous vraiment supprimer la formation "${formation.titre}" ?`)) {
            this.rhService.deleteFormation(formation.id).subscribe({
                next: () => {
                    this.loadFormations();
                },
                error: (err) => {
                    console.error('Erreur suppression formation:', err);
                    this.error.set('Erreur lors de la suppression de la formation');
                }
            });
        }
    }
}
