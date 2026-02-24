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
                // Données de démo si l'API n'est pas encore disponible
                this.projets.set(this.getDemoData());
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

    private getDemoData(): Projet[] {
        return [
            {
                id: '1', nom: 'Refonte Portail Client', description: 'Modernisation de l\'interface client',
                dateDebut: '2026-01-01', dateFin: '2026-06-30', statut: 'EN_COURS',
                client: 'Interne', budget: 50000, priorite: 'HAUTE', chargeEstimee: 120, progression: 45,
                nombreMembres: 4
            },
            {
                id: '2', nom: 'API Microservices', description: 'Migration vers architecture microservices',
                dateDebut: '2026-02-01', dateFin: '2026-09-30', statut: 'EN_COURS',
                client: 'TechCorp', budget: 80000, priorite: 'HAUTE', chargeEstimee: 200, progression: 20,
                nombreMembres: 6
            },
            {
                id: '3', nom: 'Dashboard Analytics', description: 'Tableau de bord analytique temps réel',
                dateDebut: '2025-10-01', dateFin: '2026-01-31', statut: 'TERMINE',
                client: 'DataVis SA', budget: 30000, priorite: 'MOYENNE', chargeEstimee: 80, progression: 100,
                nombreMembres: 3
            }
        ];
    }
}
