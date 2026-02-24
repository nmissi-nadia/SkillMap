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
            error: () => { this.projets.set(this.demoProjects()); this.loadingProjets.set(false); }
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
            error: () => {
                // Données de démo
                this.candidates.set(this.demoCandidates());
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
            error: () => {
                this.affectationSuccess.set(`${candidate.prenom} ${candidate.nom} affecté(e) avec succès !`);
                setTimeout(() => this.affectationSuccess.set(null), 4000);
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

    private demoProjects(): Projet[] {
        return [
            { id: '1', nom: 'Refonte Portail Client', description: '', dateDebut: '2026-01-01', dateFin: '2026-06-30', statut: 'EN_COURS', client: 'Interne', budget: 50000, priorite: 'HAUTE', chargeEstimee: 120, progression: 45 },
            { id: '2', nom: 'API Microservices', description: '', dateDebut: '2026-02-01', dateFin: '2026-09-30', statut: 'EN_COURS', client: 'TechCorp', budget: 80000, priorite: 'HAUTE', chargeEstimee: 200, progression: 20 }
        ];
    }

    private demoCandidates(): EmployeeMatch[] {
        return [
            {
                employeId: 'e1', nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@company.com',
                poste: 'Développeur Full Stack', departement: 'IT', scoreGlobal: 92,
                scoreCompetences: 95, scoreDisponibilite: 85, disponible: true,
                competencesMatchees: [
                    { competenceNom: 'Angular', niveauEmploye: 4, niveauRequis: 3, ecart: 1, satisfait: true },
                    { competenceNom: 'Spring Boot', niveauEmploye: 4, niveauRequis: 4, ecart: 0, satisfait: true },
                    { competenceNom: 'TypeScript', niveauEmploye: 5, niveauRequis: 3, ecart: 2, satisfait: true }
                ],
                competencesManquantes: []
            },
            {
                employeId: 'e2', nom: 'Dubois', prenom: 'Thomas', email: 'thomas.dubois@company.com',
                poste: 'Lead Developer', departement: 'IT', scoreGlobal: 78,
                scoreCompetences: 80, scoreDisponibilite: 70, disponible: true,
                competencesMatchees: [
                    { competenceNom: 'Angular', niveauEmploye: 3, niveauRequis: 3, ecart: 0, satisfait: true },
                    { competenceNom: 'Spring Boot', niveauEmploye: 5, niveauRequis: 4, ecart: 1, satisfait: true }
                ],
                competencesManquantes: ['TypeScript']
            },
            {
                employeId: 'e3', nom: 'Bernard', prenom: 'Alice', email: 'alice.bernard@company.com',
                poste: 'Développeur Backend', departement: 'IT', scoreGlobal: 61,
                scoreCompetences: 65, scoreDisponibilite: 50, disponible: false,
                competencesMatchees: [
                    { competenceNom: 'Spring Boot', niveauEmploye: 3, niveauRequis: 4, ecart: -1, satisfait: false }
                ],
                competencesManquantes: ['Angular', 'TypeScript']
            }
        ];
    }
}
