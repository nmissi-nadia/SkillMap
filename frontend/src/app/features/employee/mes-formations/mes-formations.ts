import { Component, OnInit, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormationDetailDTO } from '../../../core/models/formation.model';

import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-mes-formations',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, MatIconModule, DatePipe],
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
    // Utiliser un effect pour réagir au changement de l'utilisateur (ex: après refresh/login)
    effect(() => {
      const user = this.authService.currentUser();
      console.log('MesFormations: User signal changed:', user?.email);
      if (user) {
        this.currentUserId = user.id;
        this.loadMyFormations();
      } else {
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user && !this.currentUserId) {
      this.currentUserId = user.id;
      this.loadMyFormations();
    }
  }

  loadMyFormations(): void {
    if (!this.currentUserId) return;
    this.loading = true;
    console.log('📡 [MesFormations] Loading formations for user:', this.currentUserId);
    this.formationService.getEmployeeFormations(this.currentUserId).subscribe({
      next: (data) => {
        this.myFormations = data;
        this.loading = false;
        console.log('✅ [MesFormations] Formations loaded:', data.length);
      },
      error: (err) => {
        console.error('❌ [MesFormations] Error loading formations:', err);
        this.loading = false;
      },
    });
  }

  trackResourceClick(formation: FormationDetailDTO, resource: any): void {
    const userEmail = this.authService.currentUser()?.email;
    if (!userEmail || !formation.id) {
      window.open(resource.url, '_blank');
      return;
    }

    const currentInscription = this.getInscription(formation);
    const totalResources = formation.ressources?.length || 1;
    const progressStep = Math.ceil(100 / totalResources);
    
    let newProgress = (currentInscription?.progress || 0) + progressStep;
    if (newProgress > 100) newProgress = 100;

    // Mise à jour optimiste ou silencieuse
    this.formationService.updateProgress(formation.id, userEmail, newProgress).subscribe({
      next: () => {
        this.loadMyFormations(); 
      }
    });

    // Ouvrir la ressource
    window.open(resource.url, '_blank');
  }

  refresh(): void {
    this.loadMyFormations(); 
  }

  getInscription(formation: FormationDetailDTO) {
    return formation.inscriptions && formation.inscriptions.length > 0
      ? formation.inscriptions[0]
      : null;
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
