import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ManagerService } from '../../../core/services/manager.service';
import { TeamStats } from '../../../core/models/manager.model';

@Component({
    selector: 'app-manager-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './manager-dashboard.component.html',
    styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit {
    stats = signal<TeamStats | null>(null);
    loading = signal(true);
    errorMessage = signal<string | null>(null);

    constructor(private managerService: ManagerService) { }

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.managerService.getTeamStats().subscribe({
            next: (stats) => {
                this.stats.set(stats);
                this.loading.set(false);
                console.log('✅ Statistiques chargées:', stats);
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement des statistiques:', error);
                this.errorMessage.set('Impossible de charger les statistiques');
                this.loading.set(false);
            }
        });
    }
}
