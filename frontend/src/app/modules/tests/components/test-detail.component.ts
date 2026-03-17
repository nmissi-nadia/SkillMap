import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { TestService } from '../services/test.service';
import { TestTechnique } from '../models/test.model';

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule
  ],
  template: `
    <div class="test-detail-wrapper" *ngIf="test() as t">
      <!-- HEADER LAYER -->
      <header class="page-header">
        <div class="header-content">
          <button mat-icon-button routerLink="/tests" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="title-group">
            <span class="tech-label">{{t.technologie || 'Technologie'}}</span>
            <h1>{{t.titre}}</h1>
          </div>
          <div class="spacer"></div>
          <button mat-flat-button color="primary" [routerLink]="['/tests/assign', t.id]" class="action-btn">
            <mat-icon>person_add</mat-icon>
            Assigner à un Employé
          </button>
        </div>
      </header>

      <div class="content-grid">
        <!-- LEFT COLUMN: INFO & METRICS -->
        <div class="sidebar">
          <mat-card class="glass-card metrics-card">
            <div class="metric-item">
              <div class="icon-box level">
                <mat-icon>bar_chart</mat-icon>
              </div>
              <div class="metric-val">
                <span class="label">Niveau</span>
                <span class="value">{{t.niveau}}</span>
              </div>
            </div>

            <div class="metric-item">
              <div class="icon-box duration">
                <mat-icon>timer</mat-icon>
              </div>
              <div class="metric-val">
                <span class="label">Durée</span>
                <span class="value">{{t.dureeMinutes}}m</span>
              </div>
            </div>

            <div class="metric-item">
              <div class="icon-box points">
                <mat-icon>military_tech</mat-icon>
              </div>
              <div class="metric-val">
                <span class="label">Total Points</span>
                <span class="value">{{calculateTotalPoints(t)}}</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="glass-card description-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>info</mat-icon>
              <mat-card-title>Objectifs & Instructions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="desc-text">{{t.description || 'Aucune instruction fournie pour ce test.'}}</p>
              <mat-divider></mat-divider>
              <div class="meta-info">
                <div class="meta-item">
                  <mat-icon>inventory_2</mat-icon>
                  <span>Compétence: {{t.competenceId}}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- RIGHT COLUMN: QUESTIONS -->
        <div class="main-content">
          <div class="section-header">
            <h2>Structure de l'Évaluation</h2>
            <span class="count-badge">{{t.questions.length || 0}} Questions</span>
          </div>

          <div class="questions-list">
            <mat-card class="question-item" *ngFor="let q of t.questions; let i = index">
              <div class="q-header">
                <span class="inner-idx">{{i + 1}}</span>
                <span class="q-type" [class]="q.typeQuestion.toLowerCase()">{{q.typeQuestion}}</span>
                <div class="spacer"></div>
                <span class="points-badge">{{q.points}} pts</span>
              </div>
              <mat-card-content>
                <p class="question-text">{{q.contenu}}</p>
                <div class="answer-box">
                  <div class="answer-header">
                    <mat-icon>verified</mat-icon>
                    <span>Réponse attendue</span>
                  </div>
                  <p class="answer-text">{{q.bonneReponse}}</p>
                </div>
              </mat-card-content>
            </mat-card>

            <div *ngIf="!t.questions || t.questions.length === 0" class="empty-questions">
              <mat-icon>quiz</mat-icon>
              <h3>Aucune question</h3>
              <p>Ce test technique ne contient actuellement aucune question.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --glass: rgba(255, 255, 255, 0.9);
      --glass-border: rgba(255, 255, 255, 0.3);
      --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      display: block;
      min-height: 100vh;
      background: var(--bg-gradient);
    }

    .test-detail-wrapper {
      padding: 0 0 4rem 0;
    }

    .page-header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .back-btn {
      color: #64748b;
      background: #f1f5f9;
    }

    .title-group h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
    }

    .tech-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
    }

    .action-btn {
      padding: 0 1.5rem;
      height: 44px;
      border-radius: 10px;
      font-weight: 600;
    }

    .content-grid {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
    }

    .spacer { flex: 1; }

    .glass-card {
      background: var(--glass);
      backdrop-filter: blur(10px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      margin-bottom: 1.5rem;
    }

    .metrics-card {
      padding: 1.5rem;
    }

    .metric-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
    }

    .metric-item:not(:last-child) {
      border-bottom: 1px solid #f1f5f9;
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-box mat-icon { font-size: 24px; }

    .icon-box.level { background: #e0e7ff; color: #4338ca; }
    .icon-box.duration { background: #fef3c7; color: #b45309; }
    .icon-box.points { background: #dcfce7; color: #15803d; }

    .metric-val { display: flex; flex-direction: column; }
    .metric-val .label { font-size: 0.8rem; color: #64748b; font-weight: 500; }
    .metric-val .value { font-size: 1.1rem; color: #0f172a; font-weight: 700; }

    .description-card mat-card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
    }

    .desc-text {
      color: #475569;
      line-height: 1.6;
      margin: 1rem 0;
    }

    .meta-info {
      padding-top: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.85rem;
    }

    .meta-item mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }

    .count-badge {
      background: #e2e8f0;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
    }

    .question-item {
      border-radius: 16px;
      margin-bottom: 1.5rem;
      border: 1px solid #f1f5f9;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s;
    }

    .question-item:hover {
      transform: translateY(-2px);
      border-color: #cbd5e1;
    }

    .q-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid #f8fafc;
    }

    .inner-idx {
      width: 28px;
      height: 28px;
      background: #0f172a;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .q-type {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      background: #f1f5f9;
      color: #475569;
    }

    .q-type.qcm { background: #e0e7ff; color: #4338ca; }

    .points-badge {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary);
    }

    .question-text {
      font-size: 1.05rem;
      color: #1e293b;
      margin: 1rem 0;
      padding: 0 0.5rem;
    }

    .answer-box {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1rem;
      margin-top: 1rem;
      border: 1px dashed #cbd5e1;
    }

    .answer-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      color: #10b981;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .answer-header mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .answer-text {
      margin: 0;
      color: #334155;
      font-weight: 500;
    }

    .empty-questions {
      text-align: center;
      padding: 4rem 0;
      color: #94a3b8;
    }

    .empty-questions mat-icon { font-size: 4rem; width: 4rem; height: 4rem; margin-bottom: 1rem; }

    @media (max-width: 1024px) {
      .content-grid { grid-template-columns: 1fr; }
      .sidebar { order: 2; }
      .main-content { order: 1; }
    }
  `]
})
export class TestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private testService = inject(TestService);

  test = signal<TestTechnique | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.testService.getTestById(id).subscribe((data) => this.test.set(data as TestTechnique));
    }
  }

  calculateTotalPoints(test: TestTechnique): number {
    if (!test.questions) return 0;
    return test.questions.reduce((acc, q) => acc + (q.points || 0), 0);
  }
}
