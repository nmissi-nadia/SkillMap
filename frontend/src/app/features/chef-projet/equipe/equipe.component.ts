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
            error: (err) => { 
                console.error('Erreur chargement projets:', err);
                this.loadingProjets.set(false); 
            }
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
            error: (err) => { 
                console.error('Erreur chargement membres:', err);
                this.loadingMembres.set(false); 
            }
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
            error: (err) => {
                console.error('Erreur retrait membre:', err);
                alert('Impossible de retirer ce membre du projet.');
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

    getAvatarColor(nom: string): string {
        const colors = [
            'linear-gradient(135deg, #6366f1, #8b5cf6)',
            'linear-gradient(135deg, #10b981, #059669)',
            'linear-gradient(135deg, #f59e0b, #d97706)',
            'linear-gradient(135deg, #3b82f6, #2563eb)',
            'linear-gradient(135deg, #ec4899, #db2777)'
        ];
        const idx = (nom?.charCodeAt(0) ?? 0) % colors.length;
        return colors[idx];
    }

    getScoreClass(score: number): string {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'medium';
        return 'low';
    }

    getInitials(prenom: string, nom: string): string {
        return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
    }

    private showSuccess(msg: string) {
        this.successMsg.set(msg);
        setTimeout(() => this.successMsg.set(null), 4000);
    }
}
