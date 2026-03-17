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
    <div class="result-layout" *ngIf="result() as r">
      <div class="result-container">
        <!-- HEADER -->
        <header class="result-header">
           <div class="accent-line"></div>
           <div>
             <h1>Résultat de l'Évaluation</h1>
             <p>{{ r.testTitre }}</p>
           </div>
        </header>

        <!-- SCORE CARD -->
        <mat-card class="main-card">
          <div class="score-section">
            <div class="gauge-container">
              <div class="gauge-bg"></div>
              <div class="gauge-fill" [style.transform]="'rotate(' + (r.score * 1.8 - 90) + 'deg)'" [class.success]="r.score >= 60" [class.warning]="r.score >= 40 && r.score < 60" [class.error]="r.score < 40"></div>
              <div class="score-inner">
                <span class="score-value">{{ r.score }}%</span>
                <span class="score-label">Score Global</span>
              </div>
            </div>
          </div>

          <div class="feedback-box" [class.success]="r.score >= 60" [class.error]="r.score < 40">
            <div class="feedback-icon">
              <mat-icon>{{ r.score >= 60 ? 'verified_user' : 'error_outline' }}</mat-icon>
            </div>
            <div class="feedback-content">
              <h3>{{ getStatusTitle(r.score) }}</h3>
              <p>{{ getStatusMessage(r.score) }}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Statut Final</span>
              <span class="value">{{ r.statut === 'COMPLETED' ? 'Validé' : r.statut }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Recommandation</span>
              <span class="value">{{ r.score >= 60 ? 'Éligible aux projets' : 'Formation conseillée' }}</span>
            </div>
          </div>

          <footer class="card-footer">
            <button class="btn-return" routerLink="/employe/tests">
              <mat-icon>arrow_back</mat-icon>
              <span>Retour à mon espace</span>
            </button>
          </footer>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0f172a;
      --accent: #6366f1;
      --bg: #f8fafc;
      --card-bg: rgba(255, 255, 255, 0.9);
      --text: #1e293b;
      --muted: #64748b;
      --border: #e2e8f0;
      --error: #ef4444;
      --success: #10b981;
      --warning: #f59e0b;
    }

    .result-layout {
      min-height: 100vh;
      background: var(--bg);
      padding: 4rem 1rem;
      font-family: 'Inter', sans-serif;
    }

    .result-container {
      max-width: 600px;
      margin: 0 auto;
    }

    /* HEADER */
    .result-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 2.5rem; }
    .accent-line { width: 4px; height: 50px; background: var(--accent); border-radius: 10px; }
    .result-header h1 { font-family: 'Sora', sans-serif; font-size: 1.75rem; font-weight: 800; color: var(--primary); margin: 0; }
    .result-header p { color: var(--muted); font-size: 1.1rem; margin: 0.25rem 0 0; font-weight: 600; }

    /* CARD */
    .main-card {
      background: var(--card-bg);
      backdrop-filter: blur(10px);
      border: 1px solid white;
      border-radius: 32px;
      padding: 3rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);
      text-align: center;
    }

    /* SCORE GAUGE */
    .score-section { display: flex; justify-content: center; margin-bottom: 3rem; }
    .gauge-container {
      position: relative; width: 220px; height: 220px;
      display: flex; align-items: center; justify-content: center;
    }
    .gauge-bg {
      position: absolute; width: 100%; height: 100%;
      border-radius: 50%; border: 12px solid #f1f5f9;
    }
    .gauge-fill {
      position: absolute; width: 100%; height: 100%;
      border-radius: 50%; border: 12px solid transparent;
      border-top-color: var(--accent);
      transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .gauge-fill.success { border-top-color: var(--success); }
    .gauge-fill.warning { border-top-color: var(--warning); }
    .gauge-fill.error { border-top-color: var(--error); }

    .score-inner { display: flex; flex-direction: column; align-items: center; }
    .score-value { font-family: 'Sora', sans-serif; font-size: 3.5rem; font-weight: 800; color: var(--primary); line-height: 1; }
    .score-label { font-size: 0.8rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }

    /* FEEDBACK BOX */
    .feedback-box {
      display: flex; gap: 1.5rem; align-items: center; text-align: left;
      padding: 1.5rem; border-radius: 20px; margin-bottom: 2.5rem;
      border: 1px solid var(--border);
    }
    .feedback-box.success { background: #f0fdf4; border-color: #dcfce7; }
    .feedback-box.error { background: #fef2f2; border-color: #fee2e2; }

    .feedback-icon mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
    .feedback-box.success .feedback-icon { color: var(--success); }
    .feedback-box.error .feedback-icon { color: var(--error); }

    .feedback-content h3 { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 800; margin: 0 0 0.25rem; }
    .feedback-content p { color: var(--muted); font-size: 0.9rem; margin: 0; line-height: 1.5; font-weight: 500; }

    /* DETAILS */
    .details-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .detail-item {
      display: flex; flex-direction: column; gap: 0.4rem; padding: 1.25rem;
      background: #f8fafc; border-radius: 16px; border: 1px solid var(--border);
    }
    .detail-item .label { font-size: 0.75rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-item .value { font-weight: 800; color: var(--primary); font-size: 1rem; }

    /* FOOTER */
    .card-footer { border-top: 1px solid var(--border); padding-top: 2rem; }
    .btn-return {
      width: 100%; padding: 1rem; border-radius: 16px; background: var(--primary); color: white;
      border: none; font-weight: 700; display: flex; align-items: center; justify-content: center;
      gap: 0.75rem; cursor: pointer; transition: 0.3s;
    }
    .btn-return:hover { background: var(--accent); transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }

    @media (max-width: 640px) {
      .details-grid { grid-template-columns: 1fr; }
      .main-card { padding: 1.5rem; }
    }
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
