import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChefProjetService } from '../../../core/services/chef-projet.service';
import { Projet, MembreEquipe, AffectationRequest } from '../../../core/models/chef-projet.model';

@Component({
    selector: 'app-equipe',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './equipe.component.html',
    styleUrls: ['./equipe.component.scss']
})
export class EquipeComponent implements OnInit {

    projets = signal<Projet[]>([]);
    selectedProjetId = signal<string>('');
    membres = signal<MembreEquipe[]>([]);

    loadingProjets = signal(true);
    loadingMembres = signal(false);
    saving = signal(false);
    successMsg = signal<string | null>(null);

    showModalAffectation = signal(false);
    affectationForm = signal<Partial<AffectationRequest>>({
        roleDansProjet: '',
        tauxAllocation: 100,
        dateDebut: new Date().toISOString().split('T')[0]
    });

    selectedProjet = computed(() => this.projets().find(p => p.id === this.selectedProjetId()) ?? null);
    totalAllocation = computed(() => this.membres().reduce((sum, m) => sum + (m.tauxAllocation ?? 0), 0));
    membresActifs = computed(() => this.membres().filter(m => m.statut === 'ACTIVE'));

    readonly roles = ['Lead Technique', 'Développeur Backend', 'Développeur Frontend',
        'Développeur Full Stack', 'Architecte', 'QA / Testeur',
        'Designer UX/UI', 'DevOps', 'Scrum Master', 'Analyste Métier'];

    constructor(
        private chefProjetService: ChefProjetService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.loadProjets();
        this.route.queryParams.subscribe(params => {
            if (params['projetId']) {
                this.selectedProjetId.set(params['projetId']);
                this.loadMembres(params['projetId']);
            }
        });
    }

    loadProjets() {
        this.chefProjetService.getMesProjets().subscribe({
            next: d => { this.projets.set(d); this.loadingProjets.set(false); },
            error: () => { this.projets.set(this.demoProjets()); this.loadingProjets.set(false); }
        });
    }

    onProjetChange(id: string) {
        this.selectedProjetId.set(id);
        if (id) this.loadMembres(id);
    }

    loadMembres(projetId: string) {
        this.loadingMembres.set(true);
        this.membres.set([]);
        this.chefProjetService.getEquipeProjet(projetId).subscribe({
            next: d => { this.membres.set(d); this.loadingMembres.set(false); },
            error: () => { this.membres.set(this.demoMembres()); this.loadingMembres.set(false); }
        });
    }

    openAffectation() {
        this.affectationForm.set({
            roleDansProjet: '',
            tauxAllocation: 100,
            dateDebut: new Date().toISOString().split('T')[0]
        });
        this.showModalAffectation.set(true);
    }

    retirer(membre: MembreEquipe) {
        if (!confirm(`Retirer ${membre.employePrenom} ${membre.employeNom} du projet ?`)) return;
        this.chefProjetService.retirerMembre(this.selectedProjetId(), membre.employeId).subscribe({
            next: () => {
                this.membres.update(list => list.filter(m => m.employeId !== membre.employeId));
                this.showSuccess(`${membre.employePrenom} ${membre.employeNom} retiré(e) du projet`);
            },
            error: () => {
                this.membres.update(list => list.filter(m => m.employeId !== membre.employeId));
                this.showSuccess(`${membre.employePrenom} ${membre.employeNom} retiré(e) du projet`);
            }
        });
    }

    updateForm(field: keyof AffectationRequest, val: any) {
        this.affectationForm.update(f => ({ ...f, [field]: val }));
    }

    getChargeClass(taux: number): string {
        if (taux >= 90) return 'full';
        if (taux >= 60) return 'high';
        if (taux >= 30) return 'medium';
        return 'low';
    }

    getChargeLabel(taux: number): string {
        if (taux >= 90) return 'Pleine charge';
        if (taux >= 60) return 'Forte charge';
        if (taux >= 30) return 'Charge normale';
        return 'Légère charge';
    }

    getInitials(prenom: string, nom: string): string {
        return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
    }

    private showSuccess(msg: string) {
        this.successMsg.set(msg);
        setTimeout(() => this.successMsg.set(null), 4000);
    }

    private demoProjets(): Projet[] {
        return [
            { id: '1', nom: 'Refonte Portail Client', description: '', dateDebut: '2026-01-01', dateFin: '2026-06-30', statut: 'EN_COURS', client: 'Interne', budget: 50000, priorite: 'HAUTE', chargeEstimee: 120, progression: 45 },
            { id: '2', nom: 'API Microservices', description: '', dateDebut: '2026-02-01', dateFin: '2026-09-30', statut: 'EN_COURS', client: 'TechCorp', budget: 80000, priorite: 'HAUTE', chargeEstimee: 200, progression: 20 }
        ];
    }

    private demoMembres(): MembreEquipe[] {
        return [
            { id: 'a1', employeId: 'e1', employeNom: 'Martin', employePrenom: 'Sophie', employeEmail: 'sophie.martin@company.com', roleDansProjet: 'Développeur Full Stack', tauxAllocation: 100, dateDebut: '2026-01-15', statut: 'ACTIVE', scoreCompatibilite: 92, disponible: true },
            { id: 'a2', employeId: 'e2', employeNom: 'Dubois', employePrenom: 'Thomas', employeEmail: 'thomas.dubois@company.com', roleDansProjet: 'Lead Technique', tauxAllocation: 80, dateDebut: '2026-01-20', statut: 'ACTIVE', scoreCompatibilite: 78, disponible: true },
            { id: 'a3', employeId: 'e3', employeNom: 'Bernard', employePrenom: 'Alice', employeEmail: 'alice.bernard@company.com', roleDansProjet: 'QA / Testeur', tauxAllocation: 50, dateDebut: '2026-02-01', statut: 'ACTIVE', scoreCompatibilite: 61, disponible: false },
            { id: 'a4', employeId: 'e4', employeNom: 'Petit', employePrenom: 'Lucas', employeEmail: 'lucas.petit@company.com', roleDansProjet: 'Architecte', tauxAllocation: 30, dateDebut: '2026-01-10', statut: 'ACTIVE', scoreCompatibilite: 85, disponible: true }
        ];
    }
}
