import { Component, OnInit, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormationDetailDTO } from '../../../core/models/formation.model';

@Component({
  selector: 'app-mes-formations',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './mes-formations.html',
  styleUrl: './mes-formations.scss',
})
export class MesFormations implements OnInit {
  myFormations: FormationDetailDTO[] = [];
  currentUserId: string = '';
  loading = true;

  constructor(
    private formationService: FormationService,
    private authService: AuthService
  ) {
    // Utiliser un effect pour réagir au changement de l'utilisateur (ex: après refresh)
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.currentUserId = user.id;
        this.loadMyFormations();
      } else {
        // Optionnel: si l'utilisateur est déconnecté, on peut arrêter le loading
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
    // Plus besoin de charger ici, l'effect s'en occupe
  }

  loadMyFormations(): void {
    this.loading = true;
    this.formationService.getEmployeeFormations(this.currentUserId).subscribe({
      next: (data) => {
        this.myFormations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement mes formations', err);
        this.loading = false;
      }
    });
  }

  getInscription(formation: FormationDetailDTO) {
    return formation.inscriptions?.find((i: any) => i.employeId === this.currentUserId);
  }

  countCompleted(): number {
    return this.myFormations.filter(f => this.getInscription(f)?.statut === 'TERMINE').length;
  }

  countInProgress(): number {
    return this.myFormations.filter(f => {
      const s = this.getInscription(f)?.statut;
      return s === 'EN_COURS' || s === 'INSCRIT';
    }).length;
  }

  getAverageScore(): number {
    const withScore = this.myFormations
      .map(f => this.getInscription(f)?.score)
      .filter((s): s is number => s != null && s > 0);
    if (withScore.length === 0) return 0;
    return withScore.reduce((a, b) => a + b, 0) / withScore.length;
  }

  getInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'ME';
    return `${(user.nom || 'M')[0]}${(user.prenom || 'E')[0]}`.toUpperCase();
  }

  getAccentClass(type: string): string {
    const map: Record<string, string> = { PRESENTIEL: 'presentiel', LIEN: 'lien', PDF: 'pdf' };
    return map[type] || 'default';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = { PRESENTIEL: 'Présentiel', LIEN: 'En ligne', PDF: 'Document PDF' };
    return map[type] || type;
  }

  getIconForType(type: string): string {
    const map: Record<string, string> = { PRESENTIEL: 'school', LIEN: 'laptop_mac', PDF: 'description' };
    return map[type] || 'menu_book';
  }

  getStatusClass(statut?: string): string {
    const map: Record<string, string> = {
      'EN_COURS': 'en-cours',
      'TERMINE': 'termine',
      'INSCRIT': 'inscrit'
    };
    return statut ? (map[statut] || 'default-s') : 'default-s';
  }

  getStatusLabel(statut?: string): string {
    const map: Record<string, string> = {
      'EN_COURS': 'En cours',
      'TERMINE': 'Terminé',
      'INSCRIT': 'Inscrit'
    };
    return statut ? (map[statut] || statut) : '';
  }

  openResource(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
