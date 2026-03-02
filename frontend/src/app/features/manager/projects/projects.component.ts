import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';

@Component({
    selector: 'app-manager-projects',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss']
})
export class ManagerProjectsComponent implements OnInit {
    private managerService = inject(ManagerService);

    projects = signal<any[]>([]);
    loading = signal(true);
    errorMessage = signal<string | null>(null);

    // Filtres
    searchQuery = signal('');
    selectedStatus = signal('all');

    ngOnInit() {
        this.loadProjects();
    }

    loadProjects() {
        this.loading.set(true);
        this.managerService.getMyProjects().subscribe({
            next: (data) => {
                this.projects.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement projets manager:', err);
                this.errorMessage.set('Impossible de charger vos projets.');
                this.loading.set(false);
            }
        });
    }

    get filteredProjects() {
        return this.projects().filter(p => {
            const matchesSearch = p.nom.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                p.description?.toLowerCase().includes(this.searchQuery().toLowerCase());
            const matchesStatus = this.selectedStatus() === 'all' || p.statut === this.selectedStatus();
            return matchesSearch && matchesStatus;
        });
    }

    getProgressionClass(progression: number): string {
        if (progression >= 80) return 'high';
        if (progression >= 40) return 'medium';
        return 'low';
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'A_DEBUTER': 'À débuter',
            'EN_COURS': 'En cours',
            'TERMINE': 'Terminé',
            'EN_PAUSE': 'En pause'
        };
        return labels[status] || status;
    }

    viewDetails(projectId: string) {
        // Logique pour voir les détails du projet
        console.log('Viewing project details:', projectId);
    }
}
