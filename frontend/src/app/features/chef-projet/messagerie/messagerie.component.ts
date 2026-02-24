import { Component, OnInit, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChefProjetService } from '../../../core/services/chef-projet.service';
import { Projet, MessageProjet } from '../../../core/models/chef-projet.model';

@Component({
    selector: 'app-messagerie',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './messagerie.component.html',
    styleUrls: ['./messagerie.component.scss']
})
export class MessagerieComponent implements OnInit {

    @ViewChild('messagesEnd') messagesEnd!: ElementRef;

    projets = signal<Projet[]>([]);
    selectedProjetId = signal<string>('');
    messages = signal<MessageProjet[]>([]);
    nouveauMessage = signal<string>('');

    loadingProjets = signal(true);
    loadingMessages = signal(false);
    sending = signal(false);

    selectedProjet = computed(() => this.projets().find(p => p.id === this.selectedProjetId()) ?? null);
    messagesGroupes = computed(() => this.grouperParDate(this.messages()));

    // Utilisateur courant (simulé)
    readonly currentUserId = 'current-user';

    constructor(
        private chefProjetService: ChefProjetService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.loadProjets();
        this.route.queryParams.subscribe(params => {
            if (params['projetId']) {
                this.selectedProjetId.set(params['projetId']);
                this.loadMessages(params['projetId']);
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
        this.messages.set([]);
        if (id) this.loadMessages(id);
    }

    loadMessages(projetId: string) {
        this.loadingMessages.set(true);
        this.chefProjetService.getMessagesProjet(projetId).subscribe({
            next: d => {
                this.messages.set(d);
                this.loadingMessages.set(false);
                this.scrollToBottom();
            },
            error: () => {
                this.messages.set(this.demoMessages());
                this.loadingMessages.set(false);
                this.scrollToBottom();
            }
        });
    }

    envoyer() {
        const contenu = this.nouveauMessage().trim();
        if (!contenu || !this.selectedProjetId() || this.sending()) return;

        this.sending.set(true);
        this.chefProjetService.envoyerMessage({
            contenu,
            projetId: this.selectedProjetId()
        }).subscribe({
            next: (msg) => {
                this.messages.update(list => [...list, msg]);
                this.nouveauMessage.set('');
                this.sending.set(false);
                this.scrollToBottom();
            },
            error: () => {
                // Simulation locale
                const fakeMsg: MessageProjet = {
                    id: Date.now().toString(),
                    contenu,
                    dateEnvoi: new Date().toISOString(),
                    lu: false,
                    expediteur: { id: this.currentUserId, nom: 'Moi', prenom: '', role: 'CHEF_PROJET' },
                    projetId: this.selectedProjetId()
                };
                this.messages.update(list => [...list, fakeMsg]);
                this.nouveauMessage.set('');
                this.sending.set(false);
                this.scrollToBottom();
            }
        });
    }

    onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.envoyer();
        }
    }

    isMine(msg: MessageProjet): boolean {
        return msg.expediteur.id === this.currentUserId || msg.expediteur.role === 'CHEF_PROJET';
    }

    getInitials(msg: MessageProjet): string {
        return `${msg.expediteur.prenom?.[0] ?? ''}${msg.expediteur.nom?.[0] ?? ''}`.toUpperCase() || '?';
    }

    formatDate(d: string): string {
        const date = new Date(d);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    formatDateLabel(d: string): string {
        const date = new Date(d);
        const today = new Date();
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
        if (date.toDateString() === yesterday.toDateString()) return 'Hier';
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    private grouperParDate(msgs: MessageProjet[]): { date: string; messages: MessageProjet[] }[] {
        const groupes: Record<string, MessageProjet[]> = {};
        for (const m of msgs) {
            const key = new Date(m.dateEnvoi).toDateString();
            if (!groupes[key]) groupes[key] = [];
            groupes[key].push(m);
        }
        return Object.entries(groupes).map(([_, messages]) => ({
            date: messages[0].dateEnvoi,
            messages
        }));
    }

    private scrollToBottom() {
        setTimeout(() => {
            this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    private demoProjets(): Projet[] {
        return [
            { id: '1', nom: 'Refonte Portail Client', description: '', dateDebut: '2026-01-01', dateFin: '2026-06-30', statut: 'EN_COURS', client: 'Interne', budget: 50000, priorite: 'HAUTE', chargeEstimee: 120, progression: 45 },
            { id: '2', nom: 'API Microservices', description: '', dateDebut: '2026-02-01', dateFin: '2026-09-30', statut: 'EN_COURS', client: 'TechCorp', budget: 80000, priorite: 'HAUTE', chargeEstimee: 200, progression: 20 }
        ];
    }

    private demoMessages(): MessageProjet[] {
        const now = new Date();
        const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
        return [
            { id: '1', contenu: 'Bonjour l\'équipe, le sprint 3 commence lundi. Veuillez préparer vos user stories.', dateEnvoi: yesterday.toISOString(), lu: true, expediteur: { id: 'current-user', nom: 'Moi', prenom: '', role: 'CHEF_PROJET' }, projetId: '1' },
            { id: '2', contenu: 'Bien reçu ! Je prépare les estimations pour les stories d\'authentification.', dateEnvoi: yesterday.toISOString(), lu: true, expediteur: { id: 'e1', nom: 'Martin', prenom: 'Sophie', role: 'EMPLOYE' }, projetId: '1' },
            { id: '3', contenu: 'Est-ce que la revue de l\'architecture est confirmée pour vendredi ?', dateEnvoi: now.toISOString(), lu: false, expediteur: { id: 'e2', nom: 'Dubois', prenom: 'Thomas', role: 'EMPLOYE' }, projetId: '1' },
            { id: '4', contenu: 'Oui, confirmé pour vendredi 14h. Préparez vos slides.', dateEnvoi: now.toISOString(), lu: false, expediteur: { id: 'current-user', nom: 'Moi', prenom: '', role: 'CHEF_PROJET' }, projetId: '1' }
        ];
    }
}
