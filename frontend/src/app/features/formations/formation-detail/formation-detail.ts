import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormationService } from '../../../core/services/formation.service';
import { FormationDetailDTO } from '../../../core/models/formation.model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatTableModule
  ],
  templateUrl: './formation-detail.html',
  styleUrl: './formation-detail.scss',
})
export class FormationDetail implements OnInit {
  formation: FormationDetailDTO | null = null;
  insColumns: string[] = ['employe', 'date', 'statut', 'progress', 'score'];
  resColumns: string[] = ['titre', 'type', 'action'];

  constructor(
    private route: ActivatedRoute,
    private formationService: FormationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFormation(id);
    }
  }

  loadFormation(id: string): void {
    this.formationService.getFormationById(id).subscribe({
      next: (data) => this.formation = data,
      error: (err) => console.error('Erreur chargement détails formation', err)
    });
  }

  openResource(url: string): void {
    window.open(url, '_blank');
  }
}
