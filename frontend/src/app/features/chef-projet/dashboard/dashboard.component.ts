import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChefProjetService } from '../../../core/services/chef-projet.service';
import { Projet, ProjetStats } from '../../../core/models/chef-projet.model';

@Component({
    selector: 'app-chef-projet-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class ChefProjetDashboardComponent implements OnInit {
    projets = signal<Projet[]>([]);
    stats = signal<ProjetStats | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);

    projetsActifs = computed(() => this.projets().filter(p => p.statut === 'EN_COURS'));
    projetsEnRetard = computed(() => this.projets().filter(p => {
        const now = new Date();
        return p.statut !== 'TERMINE' && new Date(p.dateFin) < now;
    }));

    totalMembres = computed(() =>
        this.projets().reduce((sum, p) => sum + (p.nombreMembres ?? 0), 0)
    );

    constructor(private chefProjetService: ChefProjetService) { }

    ngOnInit() {
        this.loadAll();
    }

    loadAll() {
        this.loading.set(true);
        this.error.set(null);

        this.chefProjetService.getMesProjets().subscribe({
            next: (projets) => {
                this.projets.set(projets);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erreur projets:', err);
                this.error.set('Impossible de charger les données du dashboard.');
                this.loading.set(false);
            }
        });
    }

    getProgressionClass(progression: number): string {
        if (progression >= 75) return 'high';
        if (progression >= 40) return 'medium';
        return 'low';
    }

    getPrioriteClass(priorite: string): string {
        return priorite?.toLowerCase() ?? 'moyenne';
    }

    getStatutLabel(statut: string): string {
        const labels: Record<string, string> = {
            'PLANIFIE': 'Planifié',
            'EN_COURS': 'En cours',
            'TERMINE': 'Terminé',
            'SUSPENDU': 'Suspendu'
        };
        return labels[statut] ?? statut;
    }

    trackById(_: number, p: Projet) { return p.id; }
}
