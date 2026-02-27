import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChefProjetService } from '../../../core/services/chef-projet.service';
import { Projet, ProjetCreate } from '../../../core/models/chef-projet.model';

@Component({
    selector: 'app-chef-projet-projets',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './projets.component.html',
    styleUrls: ['./projets.component.scss']
})
export class ProjetsComponent implements OnInit {

    projets = signal<Projet[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    saving = signal(false);

    // Filtres
    filtreStatut = signal<string>('');
    filtrePriorite = signal<string>('');
    filtreRecherche = signal<string>('');

    // Modal
    showModal = signal(false);
    isEditing = signal(false);
    projetEnCours = signal<Partial<ProjetCreate>>({});
    projetIdEnEdition = signal<string | null>(null);

    // Filtrage calculé
    projetsFiltres = computed(() => {
        let result = [...this.projets()];
        if (this.filtreStatut()) result = result.filter(p => p.statut === this.filtreStatut());
        if (this.filtrePriorite()) result = result.filter(p => p.priorite === this.filtrePriorite());
        if (this.filtreRecherche()) {
            const q = this.filtreRecherche().toLowerCase();
            result = result.filter(p =>
                p.nom.toLowerCase().includes(q) ||
                p.client?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            );
        }
        return result;
    });

    constructor(private chefProjetService: ChefProjetService) { }

    ngOnInit() { this.loadProjets(); }

    loadProjets() {
        this.loading.set(true);
        this.error.set(null);
        this.chefProjetService.getMesProjets().subscribe({
            next: (data) => {
                this.projets.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement projets:', err);
                this.error.set('Impossible de charger vos projets. Veuillez réessayer plus tard.');
                this.loading.set(false);
            }
        });
    }

    openCreate() {
        this.isEditing.set(false);
        this.projetEnCours.set({
            nom: '', description: '', dateDebut: '', dateFin: '',
            statut: 'PLANIFIE', priorite: 'MOYENNE', client: '', budget: 0, chargeEstimee: 0
        });
        this.showModal.set(true);
    }

    openEdit(projet: Projet) {
        this.isEditing.set(true);
        this.projetIdEnEdition.set(projet.id);
        this.projetEnCours.set({ ...projet });
        this.showModal.set(true);
    }

    closeModal() { this.showModal.set(false); }

    save() {
        const p = this.projetEnCours();
        if (!p.nom || !p.dateDebut || !p.dateFin) return;
        this.saving.set(true);

        const obs = this.isEditing()
            ? this.chefProjetService.updateProjet(this.projetIdEnEdition()!, p)
            : this.chefProjetService.createProjet(p as ProjetCreate);

        obs.subscribe({
            next: (result) => {
                if (this.isEditing()) {
                    this.projets.update(list => list.map(pr => pr.id === result.id ? result : pr));
                } else {
                    this.projets.update(list => [result, ...list]);
                }
                this.saving.set(false);
                this.closeModal();
            },
            error: (err) => {
                console.error('Erreur sauvegarde projet:', err);
                this.error.set('Erreur lors de l\'enregistrement du projet.');
                this.saving.set(false);
            }
        });
    }

    delete(id: string) {
        if (!confirm('Confirmer la suppression de ce projet ?')) return;
        this.chefProjetService.deleteProjet(id).subscribe({
            next: () => this.projets.update(list => list.filter(p => p.id !== id)),
            error: (err) => {
                console.error('Erreur suppression projet:', err);
                this.error.set('Impossible de supprimer le projet.');
            }
        });
    }

    updateField(field: keyof ProjetCreate, value: any) {
        this.projetEnCours.update(p => ({ ...p, [field]: value }));
    }

    getStatutLabel(s: string) {
        return ({ PLANIFIE: 'Planifié', EN_COURS: 'En cours', TERMINE: 'Terminé', SUSPENDU: 'Suspendu' })[s] ?? s;
    }

    getPrioriteIcon(p: string) { return ''; }

    trackById(_: number, p: Projet) { return p.id; }
}
