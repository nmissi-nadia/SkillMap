import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RhService, SkillsMapDTO, RareSkillDTO, CriticalSkillDTO } from '../../../core/services/rh.service';

interface DashboardStats {
    totalUtilisateurs: number;
    totalEmployes: number;
    totalFormations: number;
    tauxCompletionMoyen: number;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class RhDashboardComponent implements OnInit {
    stats = signal<DashboardStats>({
        totalUtilisateurs: 0,
        totalEmployes: 0,
        totalFormations: 0,
        tauxCompletionMoyen: 0
    });

    skillsMap = signal<SkillsMapDTO | null>(null);
    rareSkills = signal<RareSkillDTO[]>([]);
    criticalSkills = signal<CriticalSkillDTO[]>([]);

    isLoading = signal(true);
    error = signal<string | null>(null);

    constructor(private rhService: RhService) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.isLoading.set(true);
        this.error.set(null);

        // Charger les statistiques globales
        this.rhService.getAllUsers(undefined, 0, 1).subscribe({
            next: (response) => {
                this.stats.update(s => ({ ...s, totalUtilisateurs: response.totalElements }));
            },
            error: (err) => console.error('Erreur chargement utilisateurs:', err)
        });

        // Charger la cartographie des compétences
        this.rhService.getSkillsMap().subscribe({
            next: (map) => {
                this.skillsMap.set(map);
                this.stats.update(s => ({ ...s, totalEmployes: map.totalEmployes }));
            },
            error: (err) => console.error('Erreur chargement skills map:', err)
        });

        // Charger les compétences rares
        this.rhService.getRareSkills(5).subscribe({
            next: (skills) => this.rareSkills.set(skills.slice(0, 5)),
            error: (err) => console.error('Erreur chargement rare skills:', err)
        });

        // Charger les compétences critiques
        this.rhService.getCriticalSkills().subscribe({
            next: (skills) => this.criticalSkills.set(skills.slice(0, 5)),
            error: (err) => console.error('Erreur chargement critical skills:', err)
        });

        // Charger les formations
        this.rhService.getAllFormations(0, 1).subscribe({
            next: (response) => {
                this.stats.update(s => ({ ...s, totalFormations: response.totalElements }));
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement formations:', err);
                this.isLoading.set(false);
            }
        });
    }

    getCategorieKeys(): string[] {
        const map = this.skillsMap();
        return map ? Object.keys(map.repartitionParCategorie) : [];
    }

    getRareteColor(rarete: string): string {
        switch (rarete) {
            case 'UNIQUE': return '#dc2626';
            case 'TRÈS_RARE': return '#ea580c';
            case 'RARE': return '#f59e0b';
            default: return '#10b981';
        }
    }

    getCriticiteColor(criticite: string): string {
        switch (criticite) {
            case 'CRITIQUE': return '#dc2626';
            case 'HAUTE': return '#ea580c';
            case 'MOYENNE': return '#f59e0b';
            default: return '#10b981';
        }
    }
}
