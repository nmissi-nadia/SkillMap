import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RhService, SkillsMapDTO, RareSkillDTO, CriticalSkillDTO } from '../../../core/services/rh.service';

@Component({
    selector: 'app-skills-map',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './skills-map.component.html',
    styleUrls: ['./skills-map.component.css']
})
export class SkillsMapComponent implements OnInit {
    skillsMap = signal<SkillsMapDTO | null>(null);
    rareSkills = signal<RareSkillDTO[]>([]);
    criticalSkills = signal<CriticalSkillDTO[]>([]);

    // Filtres (propriétés simples pour ngModel bidirectionnel)
    selectedDepartment = '';
    selectedPoste = '';
    selectedNiveau: number | undefined = undefined;

    departments = signal<string[]>([]);

    isLoading = signal(true);
    error = signal<string | null>(null);

    constructor(private rhService: RhService) { }

    ngOnInit(): void {
        this.loadDepartments();
        this.loadSkillsData();
    }

    loadDepartments(): void {
        this.rhService.getDepartments().subscribe({
            next: (deps) => this.departments.set(deps),
            error: (err) => console.error('Erreur chargement départements:', err)
        });
    }

    loadSkillsData(): void {
        this.isLoading.set(true);
        this.error.set(null);

        const dept = this.selectedDepartment || undefined;
        const poste = this.selectedPoste || undefined;
        const niveau = this.selectedNiveau;

        // Charger la cartographie
        this.rhService.getSkillsMap(dept, poste, niveau).subscribe({
            next: (map) => {
                this.skillsMap.set(map);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement skills map:', err);
                this.error.set('Erreur lors du chargement de la cartographie');
                this.isLoading.set(false);
            }
        });

        // Charger les compétences rares
        this.rhService.getRareSkills(10).subscribe({
            next: (skills) => this.rareSkills.set(skills),
            error: (err) => console.error('Erreur chargement rare skills:', err)
        });

        // Charger les compétences critiques
        this.rhService.getCriticalSkills().subscribe({
            next: (skills) => this.criticalSkills.set(skills),
            error: (err) => console.error('Erreur chargement critical skills:', err)
        });
    }

    applyFilters(): void {
        this.loadSkillsData();
    }

    resetFilters(): void {
        this.selectedDepartment = '';
        this.selectedPoste = '';
        this.selectedNiveau = undefined;
        this.loadSkillsData();
    }

    getCategorieKeys(): string[] {
        const map = this.skillsMap();
        return map ? Object.keys(map.repartitionParCategorie) : [];
    }

    getCategorieValue(categorie: string): number {
        const map = this.skillsMap();
        return map ? map.repartitionParCategorie[categorie] : 0;
    }

    getCategoriePercentage(categorie: string): number {
        const map = this.skillsMap();
        if (!map || map.totalCompetences === 0) return 0;
        return (map.repartitionParCategorie[categorie] / map.totalCompetences) * 100;
    }

    getNiveauKeys(): string[] {
        const map = this.skillsMap();
        return map?.distributionNiveaux ? Object.keys(map.distributionNiveaux) : [];
    }

    getLevelPercentage(niveau: string): number {
        const map = this.skillsMap();
        if (!map?.distributionNiveaux || map.totalCompetences === 0) return 0;
        return (map.distributionNiveaux[niveau] / map.totalCompetences) * 100;
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
