import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChefProjetService, EmployeSimple } from '../../../core/services/chef-projet.service';
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

    // ── Modal affectation ──
    showModalAffectation = signal(false);
    allEmployes = signal<EmployeSimple[]>([]);
    loadingEmployes = signal(false);
    searchQuery = signal('');
    selectedEmployeId = signal<string | null>(null);

    affectationForm = signal<Partial<AffectationRequest>>({
        roleDansProjet: '',
        tauxAllocation: 100,
        dateDebut: new Date().toISOString().split('T')[0]
    });

    // ── Détails employé ──
    showDetailEmploye = signal(false);
    detailEmploye = signal<EmployeSimple | null>(null);

    selectedProjet = computed(() => this.projets().find(p => p.id === this.selectedProjetId()) ?? null);
    totalAllocation = computed(() => this.membres().reduce((sum, m) => sum + (m.tauxAllocation ?? 0), 0));
    membresActifs = computed(() => this.membres().filter(m => m.statut === 'ACTIVE'));

    filteredEmployes = computed(() => {
        const q = this.searchQuery().toLowerCase();
        const membresIds = new Set(this.membres().map(m => m.employeId));
        return this.allEmployes()
            .filter(e => !membresIds.has(e.id))  // Exclure les membres déjà affectés
            .filter(e => {
                if (!q) return true;
                return (e.nom?.toLowerCase().includes(q) ||
                    e.prenom?.toLowerCase().includes(q) ||
                    e.email?.toLowerCase().includes(q) ||
                    e.poste?.toLowerCase().includes(q) ||
                    e.departement?.toLowerCase().includes(q));
            });
    });

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
            error: () => this.loadingProjets.set(false)
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
            error: () => this.loadingMembres.set(false)
        });
    }

    // ── Modal Affectation ──

    openAffectation() {
        this.affectationForm.set({
            roleDansProjet: '',
            tauxAllocation: 100,
            dateDebut: new Date().toISOString().split('T')[0]
        });
        this.selectedEmployeId.set(null);
        this.searchQuery.set('');
        this.showModalAffectation.set(true);

        if (this.allEmployes().length === 0) {
            this.loadingEmployes.set(true);
            this.chefProjetService.getAllEmployes().subscribe({
                next: d => { this.allEmployes.set(d); this.loadingEmployes.set(false); },
                error: () => this.loadingEmployes.set(false)
            });
        }
    }

    closeModal() {
        this.showModalAffectation.set(false);
        this.showDetailEmploye.set(false);
    }

    selectEmploye(employe: EmployeSimple) {
        this.selectedEmployeId.set(employe.id);
    }

    voirDetail(employe: EmployeSimple) {
        this.detailEmploye.set(employe);
        this.showDetailEmploye.set(true);
    }

    submitAffectation() {
        const employeId = this.selectedEmployeId();
        const projetId = this.selectedProjetId();
        if (!employeId || !projetId) return;

        this.saving.set(true);
        const req: AffectationRequest = {
            employeId: employeId,
            roleDansProjet: this.affectationForm().roleDansProjet || 'Développeur',
            tauxAllocation: this.affectationForm().tauxAllocation || 100,
            dateDebut: this.affectationForm().dateDebut || new Date().toISOString().split('T')[0]
        };

        this.chefProjetService.affecterMembre(projetId, req).subscribe({
            next: () => {
                this.showModalAffectation.set(false);
                this.saving.set(false);
                this.showSuccess('Employé affecté au projet avec succès !');
                this.loadMembres(projetId);
            },
            error: (err) => {
                console.error('Erreur affectation:', err);
                this.saving.set(false);
                alert('Erreur lors de l\'affectation. Vérifiez que l\'employé n\'est pas déjà membre.');
            }
        });
    }

    // ── Gestion des membres ──

    retirer(membre: MembreEquipe) {
        if (!confirm(`Retirer ${membre.employePrenom} ${membre.employeNom} du projet ?`)) return;
        this.chefProjetService.retirerMembre(this.selectedProjetId(), membre.employeId).subscribe({
            next: () => {
                this.membres.update(list => list.filter(m => m.employeId !== membre.employeId));
                this.showSuccess(`${membre.employePrenom} ${membre.employeNom} retiré(e) du projet`);
            },
            error: () => alert('Impossible de retirer ce membre du projet.')
        });
    }

    // ── Helpers ──

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
