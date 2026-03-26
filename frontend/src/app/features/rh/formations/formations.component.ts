import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RhService, FormationDTO, FormationBudgetDTO, PageResponse, UtilisateurDTO } from '../../../core/services/rh.service';
import { MetadataService, MetadataOption } from '../../../core/services/metadata.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
    selector: 'app-formations',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
    templateUrl: './formations.component.html',
    styleUrls: ['./formations.component.scss']
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
    showAssignModal = signal(false);
    isEditing = signal(false);
    isSaving = signal(false);

    // Assignment state
    employees = signal<UtilisateurDTO[]>([]);
    selectedEmployeeIds = signal<string[]>([]);
    searchTerm = signal('');
    isAssigning = signal(false);

    // Metadata
    formationStatuts = signal<MetadataOption[]>([]);
    formationTypes = signal<MetadataOption[]>([]);

    editForm: any = {
        titre: '',
        organisme: '',
        type: 'PRESENTIEL',
        statut: 'PLANIFIEE',
        description: '',
        dateDebut: '',
        dateFin: '',
        cout: 0,
        maxParticipants: 10
    };

    constructor(private rhService: RhService, private metadataService: MetadataService) { }

    ngOnInit(): void {
        this.loadMetadata();
        this.loadFormations();
    }

    loadMetadata(): void {
        this.metadataService.getMetadata().subscribe(meta => {
            this.formationStatuts.set(meta.formationStatuts);
            this.formationTypes.set(meta.formationTypes);
        });
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
        const s = (statut || '').toUpperCase();
        switch (s) {
            case 'PLANIFIÉE':
            case 'PLANIFIEE':
                return 'var(--info)';
            case 'EN_COURS':
                return 'var(--warning)';
            case 'TERMINÉE':
            case 'TERMINEE':
                return 'var(--success)';
            case 'ANNULÉE':
            case 'ANNULEE':
                return 'var(--error)';
            default:
                return 'var(--text-light)';
        }
    }

    getStatutLabel(statut: string): string {
        return this.metadataService.getLabel(this.formationStatuts(), statut);
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
            type: 'PRESENTIEL',
            statut: 'PLANIFIEE',
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
            type: formation.type || 'PRESENTIEL',
            statut: formation.statut || 'PLANIFIEE',
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

    // ========== ASSIGNATION Logic ==========

    openAssignModal(formation: FormationDTO): void {
        this.selectedFormation.set(formation);
        this.selectedEmployeeIds.set([]);
        this.searchTerm.set('');
        this.showAssignModal.set(true);
        
        // Charger les employés si la liste est vide
        if (this.employees().length === 0) {
            this.rhService.getAllUsers('EMPLOYE', 0, 100).subscribe({
                next: (res) => this.employees.set(res.content),
                error: (err) => console.error('Erreur chargement employés:', err)
            });
        }
    }

    closeAssignModal(): void {
        this.showAssignModal.set(false);
        this.selectedFormation.set(null);
    }

    toggleEmployeeSelection(id: string): void {
        const current = this.selectedEmployeeIds();
        if (current.includes(id)) {
            this.selectedEmployeeIds.set(current.filter(i => i !== id));
        } else {
            this.selectedEmployeeIds.set([...current, id]);
        }
    }

    get filteredEmployees(): UtilisateurDTO[] {
        const term = this.searchTerm().toLowerCase();
        return this.employees().filter(e => 
            e.nom.toLowerCase().includes(term) || 
            e.prenom.toLowerCase().includes(term) || 
            e.email.toLowerCase().includes(term)
        );
    }

    confirmAssignation(): void {
        const formationId = this.selectedFormation()?.id;
        const employeIds = this.selectedEmployeeIds();

        if (!formationId || employeIds.length === 0) return;

        this.isAssigning.set(true);
        this.rhService.assignFormation({
            formationId,
            employeIds
        }).subscribe({
            next: () => {
                this.isAssigning.set(false);
                this.closeAssignModal();
                this.loadFormations();
                // Notification de succès via le service ? On pourrait injecter MatSnackBar
                alert('Affectation réussie !');
            },
            error: (err) => {
                console.error('Erreur affectation:', err);
                this.isAssigning.set(false);
                alert('Erreur lors de l\'affectation.');
            }
        });
    }
}
