import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormationDetailDTO } from '../../../core/models/formation.model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-mes-formations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatExpansionModule
  ],
  templateUrl: './mes-formations.html',
  styleUrl: './mes-formations.scss',
})
export class MesFormations implements OnInit {
  myFormations: FormationDetailDTO[] = [];
  currentUserId: string = '';

  constructor(
    private formationService: FormationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      this.loadMyFormations();
    }
  }

  loadMyFormations(): void {
    this.formationService.getEmployeeFormations(this.currentUserId).subscribe({
      next: (data) => this.myFormations = data,
      error: (err) => console.error('Erreur chargement mes formations', err)
    });
  }

  getInscription(formation: FormationDetailDTO) {
    return formation.inscriptions.find(i => i.employeId === this.currentUserId);
  }

  openResource(url: string): void {
    window.open(url, '_blank');
  }
}
