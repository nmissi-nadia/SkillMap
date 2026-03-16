import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TestService } from '../services/test.service';
import { TestTechnique } from '../models/test.model';
import { environment } from '../../../../environments/environment';

interface EmployeSimpleDTO {
  id: string;
  nom: string;
  prenom: string;
  poste?: string;
  email?: string;
}

@Component({
  selector: 'app-assign-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="assign-container">
      <div class="header">
        <button mat-icon-button routerLink="/tests">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Assigner un Test Technique</h1>
      </div>

      <mat-card *ngIf="test() as t">
        <mat-card-header>
          <mat-card-title>Test : {{t.titre}}</mat-card-title>
          <mat-card-subtitle>Niveau: {{t.niveau}} | Durée: {{t.dureeMinutes}} min</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <p class="description">{{t.description}}</p>

          <div class="selection-box">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sélectionner l'Employé</mat-label>
              <mat-select [(ngModel)]="selectedEmployeId">
                <mat-option *ngFor="let emp of employees()" [value]="emp.id">
                  {{emp.prenom}} {{emp.nom}} ({{emp.poste || 'Employé'}})
                </mat-option>
              </mat-select>
            </mat-form-field>
            <p class="hint" *ngIf="employees().length === 0 && !loading">Aucun employé disponible.</p>
          </div>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button routerLink="/tests">Annuler</button>
          <button mat-raised-button color="primary" [disabled]="!selectedEmployeId" (click)="onAssign()">
            Confirmer l'Assignation
          </button>
        </mat-card-actions>
      </mat-card>

      <div *ngIf="!test()" style="padding:2rem;text-align:center;color:#999">
        Chargement du test…
      </div>
    </div>
  `,
  styles: [`
    .assign-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .description {
      margin: 1.5rem 0;
      color: var(--text-secondary, #666);
    }
    .selection-box {
      margin-top: 2rem;
    }
    .full-width {
      width: 100%;
    }
    .hint {
      font-size: 0.8rem;
      color: #f44336;
      margin-top: -0.5rem;
    }
  `]
})
export class AssignTestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testService = inject(TestService);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  test = signal<TestTechnique | null>(null);
  employees = signal<EmployeSimpleDTO[]>([]);
  selectedEmployeId: string | null = null;
  loading = true;

  ngOnInit(): void {
    const testId = this.route.snapshot.paramMap.get('id');
    if (testId) {
      this.testService.getTestById(testId).subscribe(data => this.test.set(data));
    }
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    // Utilise GET /api/employes accessible à ROLE_MANAGER (pas besoin de ROLE_RH)
    this.http.get<EmployeSimpleDTO[]>(`${environment.apiUrl}/employes`).subscribe({
      next: (res) => {
        this.employees.set(res);
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Erreur chargement employés:', err);
        this.loading = false;
        this.snackBar.open('Impossible de charger la liste des employés.', 'Fermer', { duration: 4000 });
      }
    });
  }

  onAssign(): void {
    const testId = this.test()?.id;
    if (testId && this.selectedEmployeId) {
      this.testService.assignTest(testId, this.selectedEmployeId).subscribe({
        next: () => {
          this.snackBar.open('Test assigné avec succès !', 'Fermer', { duration: 3000 });
          this.router.navigate(['/tests']);
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Erreur lors de l\'assignation.';
          this.snackBar.open(msg, 'Fermer', { duration: 4000 });
        }
      });
    }
  }
}
