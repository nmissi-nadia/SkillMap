import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChefProjetService } from '../../../core/services/chef-projet.service';
import { Projet, EmployeeMatch } from '../../../core/models/chef-projet.model';

@Component({
    selector: 'app-matching',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './matching.component.html',
    styleUrls: ['./matching.component.scss']
})
export class MatchingComponent implements OnInit {

    projets = signal<Projet[]>([]);
    selectedProjetId = signal<string>('');
    candidates = signal<EmployeeMatch[]>([]);
    selectedCandidate = signal<EmployeeMatch | null>(null);
    scoreMin = signal(50);

    loadingProjets = signal(true);
    loadingMatching = signal(false);
    matchingDone = signal(false);
    affectationSuccess = signal<string | null>(null);

    candidatesTries = computed(() =>
        [...this.candidates()].sort((a, b) => b.scoreGlobal - a.scoreGlobal)
    );

    selectedProjet = computed(() =>
        this.projets().find(p => p.id === this.selectedProjetId()) ?? null
    );

    constructor(
        private chefProjetService: ChefProjetService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.loadProjets();
        // Pré-sélectionner depuis queryParam
        this.route.queryParams.subscribe(params => {
            if (params['projetId']) {
                this.selectedProjetId.set(params['projetId']);
            }
        });
    }

    loadProjets() {
        this.chefProjetService.getMesProjets().subscribe({
            next: (data) => { this.projets.set(data); this.loadingProjets.set(false); },
            error: (err) => { 
                console.error('Erreur chargement projets:', err);
                this.loadingProjets.set(false); 
            }
        });
    }

    lancerMatching() {
        if (!this.selectedProjetId()) return;
        this.loadingMatching.set(true);
        this.matchingDone.set(false);
        this.candidates.set([]);
        this.selectedCandidate.set(null);
        this.affectationSuccess.set(null);

        this.chefProjetService.lancerMatching(this.selectedProjetId(), this.scoreMin()).subscribe({
            next: (data) => {
                this.candidates.set(data);
                this.loadingMatching.set(false);
                this.matchingDone.set(true);
            },
            error: (err) => {
                console.error('Erreur matching:', err);
                this.loadingMatching.set(false);
                this.matchingDone.set(true);
            }
        });
    }

    selectCandidate(c: EmployeeMatch) {
        this.selectedCandidate.set(c === this.selectedCandidate() ? null : c);
    }

    validerAffectation(candidate: EmployeeMatch) {
        const projetId = this.selectedProjetId();
        this.chefProjetService.affecterMembre(projetId, {
            employeId: candidate.employeId,
            roleDansProjet: 'Développeur',
            tauxAllocation: 80,
            dateDebut: new Date().toISOString().split('T')[0]
        }).subscribe({
            next: () => {
                this.affectationSuccess.set(`${candidate.prenom} ${candidate.nom} affecté(e) avec succès !`);
                setTimeout(() => this.affectationSuccess.set(null), 4000);
            },
            error: (err) => {
                console.error('Erreur affectation:', err);
                // On peut ajouter un signal d'erreur ici si besoin
                alert(`Erreur lors de l'affectation de ${candidate.prenom} ${candidate.nom}`);
            }
        });
    }

    getScoreClass(score: number): string {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'medium';
        return 'low';
    }

    getScoreLabel(score: number): string {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Bon';
        if (score >= 40) return 'Moyen';
        return 'Faible';
    }

    getNiveauLabel(n: number): string {
        return ['', 'Débutant', 'Intermédiaire', 'Avancé', 'Expert', 'Maître'][n] ?? `Niv.${n}`;
    }
}
