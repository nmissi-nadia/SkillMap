import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TestExecutionService } from '../services/test-execution.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="result-container" *ngIf="result() as r">
      <mat-card class="result-card">
        <mat-card-header>
          <mat-card-title>Résultat du Test</mat-card-title>
          <mat-card-subtitle>{{ r.test?.titre }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="content">
          <div class="score-display">
            <div class="score-circle" [class.pass]="r.score >= 60" [class.fail]="r.score < 40">
              <span class="score-value">{{ r.score }}%</span>
              <span class="score-label">Score Final</span>
            </div>
          </div>

          <div class="feedback-section">
            <div class="feedback-item">
              <mat-icon [color]="r.score >= 60 ? 'primary' : 'warn'">
                {{ r.score >= 60 ? 'check_circle' : 'info' }}
              </mat-icon>
              <div class="feedback-text">
                <h3>{{ getStatusTitle(r.score) }}</h3>
                <p>{{ getStatusMessage(r.score) }}</p>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Statut</span>
              <span class="stat-value">{{ r.statut }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Niveau Attribué</span>
              <span class="stat-value">Lvl {{ r.score >= 80 ? 4 : r.score >= 60 ? 3 : r.score >= 40 ? 2 : 1 }}</span>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-raised-button color="primary" routerLink="/employe/tests">Retour à mes tests</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .result-container {
      padding: 3rem;
      display: flex;
      justify-content: center;
      background: var(--background);
      min-height: calc(100vh - 64px);
    }
    .result-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      border-radius: 16px;
      box-shadow: var(--shadow-xl);
    }
    .content { padding: 2rem; }
    .score-display {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }
    .score-circle {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      border: 10px solid #E5E7EB;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
    }
    .score-circle.pass { border-color: var(--success); color: var(--success); }
    .score-circle.fail { border-color: var(--error); color: var(--error); }
    .score-value { font-size: 3rem; font-weight: 800; line-height: 1; }
    .score-label { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    .feedback-section {
      margin-bottom: 2rem;
      text-align: left;
      padding: 1rem;
      background: #F9FAFB;
      border-radius: 8px;
    }
    .feedback-item { display: flex; gap: 1rem; align-items: flex-start; }
    .feedback-text h3 { margin: 0 0 0.25rem 0; font-size: 1.1rem; }
    .feedback-text p { margin: 0; color: var(--text-secondary); font-size: 0.9rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 2rem;
    }
    .stat-card {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background: #F3F4F6;
      border-radius: 8px;
    }
    .stat-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; }
    .stat-value { font-weight: bold; font-size: 1.1rem; }
  `]
})
export class TestResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private executionService = inject(TestExecutionService);
  private authService = inject(AuthService);

  result = signal<any>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const user = this.authService.currentUser();
    if (id && user?.id) {
      this.executionService.getEmployeTests(user.id).subscribe(tests => {
        const found = tests.find(t => t.id === id);
        this.result.set(found);
      });
    }
  }

  getStatusTitle(score: number): string {
    if (score >= 80) return 'Excellent Travail !';
    if (score >= 60) return 'Test Réussi';
    if (score >= 40) return 'Résultat Moyen';
    return 'Test à Repasser';
  }

  getStatusMessage(score: number): string {
    if (score >= 80) return 'Vous maîtrisez parfaitement cette compétence. Votre profil a été mis à jour au niveau Senior.';
    if (score >= 60) return 'Félicitations, vous avez validé vos acquis. Votre niveau de compétence a été rehaussé.';
    if (score >= 40) return 'Vos bases sont solides mais certains points nécessitent encore de la pratique.';
    return 'Le score obtenu est insuffisant pour valider un nouveau niveau. Nous vous conseillons de suivre une formation complémentaire.';
  }
}
