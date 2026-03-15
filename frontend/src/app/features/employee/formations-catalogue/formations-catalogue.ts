import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormationDetailDTO } from '../../../core/models/formation.model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-formations-catalogue',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './formations-catalogue.html',
  styleUrl: './formations-catalogue.scss',
})
export class FormationsCatalogue implements OnInit {
  formations: FormationDetailDTO[] = [];
  currentUserId: string = '';

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
    }
    this.loadCatalogue();
  }

  loadCatalogue(): void {
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        // Filtrer les formations où l'employé n'est pas encore inscrit
        this.formations = data.filter(f =>
          !f.inscriptions.some(i => i.employeId === this.currentUserId)
        );
      },
      error: (err) => console.error('Erreur chargement catalogue', err)
    });
  }

  sinscrire(formationId: string): void {
    if (!this.currentUserId) return;

    this.formationService.assignFormationToEmployee(formationId, this.currentUserId).subscribe({
      next: () => {
        this.snackBar.open('Inscription réussie ! Vous la retrouverez dans Mes Formations', 'Fermer', { duration: 4000 });
        this.loadCatalogue(); // Rafraichir le catalogue
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Erreur lors de l\'inscription', 'Fermer', { duration: 3000 });
      }
    });
  }
}
