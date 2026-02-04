import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ManagerService } from '../../../core/services/manager.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
    selector: 'app-team-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
    team = signal<Employee[]>([]);
    loading = signal(true);
    errorMessage = signal<string | null>(null);

    constructor(private managerService: ManagerService) { }

    ngOnInit() {
        this.loadTeam();
    }

    loadTeam() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.managerService.getMyTeam().subscribe({
            next: (team) => {
                this.team.set(team);
                this.loading.set(false);
                console.log('✅ Équipe chargée:', team);
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement de l\'équipe:', error);
                this.errorMessage.set('Impossible de charger votre équipe');
                this.loading.set(false);
            }
        });
    }

    getDisponibiliteLabel(disponible: boolean): string {
        return disponible ? 'Disponible' : 'Non disponible';
    }

    getDisponibiliteClass(disponible: boolean): string {
        return disponible ? 'badge-success' : 'badge-warning';
    }
}
