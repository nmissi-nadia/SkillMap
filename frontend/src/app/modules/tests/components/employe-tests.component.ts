import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TestExecutionService } from '../services/test-execution.service';
import { AuthService } from '../../../core/services/auth.service';
import { TestEmploye } from '../models/test.model';

@Component({
  selector: 'app-employe-tests',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="page-layout">
      <!-- HEADER -->
      <header class="dashboard-header">
        <div class="title-group">
          <div class="accent-pill"></div>
          <div>
            <h1>Mes Évaluations</h1>
            <p>Retrouvez ici vos tests techniques en attente ou terminés.</p>
          </div>
        </div>
      </header>

      <!-- ANALYTICS/STATS QUICK VIEW -->
      <section class="overview-stats">
        <div class="stat-card">
          <div class="stat-icon-wrap pending">
            <mat-icon>hourglass_empty</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-num">{{getPendingCount()}}</span>
            <span class="stat-desc">À Passer</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap completed">
            <mat-icon>task_alt</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-num">{{getCompletedCount()}}</span>
            <span class="stat-desc">Terminés</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap avg">
            <mat-icon>analytics</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-num">{{getAverageScore()}}%</span>
            <span class="stat-desc">Score Moyen</span>
          </div>
        </div>
      </section>

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <div *ngIf="assignedTests().length > 0" class="test-grid">
          <div *ngFor="let te of assignedTests()" class="test-card" [class.completed]="te.statut === 'COMPLETED'">
            <div class="card-top">
              <span class="status-badge" [class]="te.statut.toLowerCase()">
                {{te.statut === 'ASSIGNED' ? 'À démarrer' : te.statut === 'IN_PROGRESS' ? 'En cours' : 'Terminé'}}
              </span>
              <span class="tech-tag">{{te.technologie || 'Générique'}}</span>
            </div>

            <h3 class="test-title">{{te.testTitre}}</h3>
            <p class="test-desc">{{te.testDescription}}</p>

            <div class="card-footer">
              <div class="meta-info">
                <div class="meta-item">
                  <mat-icon>timer</mat-icon>
                  <span>{{te.testDuree}} min</span>
                </div>
                <div class="meta-item" *ngIf="te.score !== null && te.statut === 'COMPLETED'">
                  <mat-icon>emoji_events</mat-icon>
                  <span class="score-text">{{te.score}}%</span>
                </div>
              </div>

              <div class="actions">
                <button class="btn-primary" *ngIf="te.statut !== 'COMPLETED'" [routerLink]="['/employe/tests', te.id, 'pass']">
                  <mat-icon>{{ te.statut === 'ASSIGNED' ? 'play_arrow' : 'forward' }}</mat-icon>
                  <span>{{ te.statut === 'ASSIGNED' ? 'Démarrer' : 'Reprendre' }}</span>
                </button>
                <button class="btn-outline" *ngIf="te.statut === 'COMPLETED'" [routerLink]="['/employe/tests', te.id, 'result']">
                  <mat-icon>visibility</mat-icon>
                  <span>Résultat</span>
                </button>
              </div>
            </div>

            <!-- PROGRESS INDICATOR FOR SCORE (ONLY IF COMPLETED) -->
            <div class="score-bar" *ngIf="te.statut === 'COMPLETED'">
              <div class="progress" [style.width]="te.score + '%'" [class.low]="(te.score || 0) < 50" [class.mid]="(te.score || 0) >= 50 && (te.score || 0) < 80" [class.high]="(te.score || 0) >= 80"></div>
            </div>
          </div>
        </div>

        <div *ngIf="assignedTests().length === 0" class="empty-state">
          <div class="empty-icon">
            <mat-icon>assignment_late</mat-icon>
          </div>
          <h2>Aucun test assigné</h2>
          <p>Vous n'avez pas d'évaluations techniques prévues pour le moment.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--text-primary);
      --accent: var(--primary);
      --bg: var(--bg-light);
      --card-bg: #ffffff;
      --text: var(--text-primary);
      --muted: var(--text-secondary);
      --border: var(--border-light);
    }

    .page-layout {
      padding: 2.5rem 3rem;
      max-width: 1400px;
      margin: 0 auto;
      background: var(--bg);
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }

    /* HEADER */
    .dashboard-header {
      margin-bottom: 3rem;
    }
    .title-group { display: flex; align-items: center; gap: 1.25rem; }
    .accent-pill { width: 5px; height: 50px; background: var(--accent); border-radius: 10px; }
    .title-group h1 { font-family: 'Sora', sans-serif; font-size: 2.25rem; font-weight: 800; color: var(--primary); margin: 0; letter-spacing: -0.03em; }
    .title-group p { color: var(--muted); font-size: 1rem; margin: 0; }

    /* OVERVIEW STATS */
    .overview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .stat-card {
      background: var(--card-bg);
      padding: 1.5rem;
      border-radius: 24px;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border: 1px solid var(--border);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }
    .stat-icon-wrap { 
      width: 54px; height: 54px; border-radius: 16px; 
      display: flex; align-items: center; justify-content: center; 
    }
    .stat-icon-wrap.pending { background: rgba(218,30,40,0.1); color: var(--error); }
    .stat-icon-wrap.completed { background: rgba(36,161,72,0.1); color: var(--success); }
    .stat-icon-wrap.avg { background: rgba(15,98,254,0.1); color: var(--primary); }
    
    .stat-num { display: block; font-family: 'Sora', sans-serif; font-size: 1.75rem; font-weight: 800; color: var(--primary); line-height: 1; }
    .stat-desc { font-size: 0.8rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }

    /* GRID & CARDS */
    .test-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
    }
    .test-card {
      background: white;
      border-radius: 28px;
      padding: 2rem;
      border: 1px solid var(--border);
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .test-card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }

    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .status-badge { 
      font-size: 0.65rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 8px; text-transform: uppercase; 
      letter-spacing: 0.05em;
    }
    .status-badge.assigned { background: var(--bg-light); color: #475569; }
    .status-badge.in_progress { background: #fff7ed; color: #c2410c; }
    .status-badge.completed { background: #ecfdf5; color: #059669; }
    
    .tech-tag { font-size: 0.7rem; font-weight: 700; color: var(--muted); background: #f8fafc; padding: 0.3rem 0.7rem; border-radius: 6px; }

    .test-title { font-family: 'Sora', sans-serif; font-size: 1.35rem; font-weight: 800; color: var(--primary); margin: 0 0 0.75rem; line-height: 1.3; }
    .test-desc { color: var(--muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3.1em; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .meta-info { display: flex; flex-direction: column; gap: 0.4rem; }
    .meta-item { display: flex; align-items: center; gap: 0.5rem; color: var(--muted); font-size: 0.85rem; font-weight: 600; }
    .meta-item mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .score-text { color: var(--accent); font-weight: 800; font-size: 1rem; }

    .btn-primary {
      background: var(--primary); color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 12px;
      font-weight: 700; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: 0.2s;
    }
    .btn-primary:hover { background: var(--accent); transform: scale(1.05); }
    
    .btn-outline {
      background: transparent; color: var(--primary); border: 2px solid var(--primary); padding: 0.5rem 1.1rem; border-radius: 12px;
      font-weight: 700; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: 0.2s;
    }
    .btn-outline:hover { background: var(--primary); color: white; }

    .score-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 5px; background: var(--bg-light); }
    .progress { height: 100%; transition: width 1s ease-out; }
    .progress.low { background: var(--error); }
    .progress.mid { background: var(--warning); }
    .progress.high { background: var(--success); }

    .empty-state { padding: 8rem 0; text-align: center; display: flex; flex-direction: column; align-items: center; color: var(--muted); }
    .empty-icon { font-size: 4rem; width: 4rem; height: 4rem; opacity: 0.2; margin-bottom: 1.5rem; }
    .empty-state h2 { font-family: 'Sora', sans-serif; color: var(--primary); margin: 0 0 0.5rem; font-weight: 800; }

    @media (max-width: 768px) {
      .page-layout { padding: 1.5rem; }
      .overview-stats { grid-template-columns: 1fr; }
      .test-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class EmployeTestsComponent implements OnInit {
  private executionService = inject(TestExecutionService);
  private authService = inject(AuthService);

  assignedTests = signal<TestEmploye[]>([]);
  displayedColumns: string[] = ['titre', 'statut', 'score', 'actions'];

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.executionService.getEmployeTests(user.id).subscribe(data => this.assignedTests.set(data));
    }
  }

  getPendingCount(): number {
    return this.assignedTests().filter(t => t.statut !== 'COMPLETED').length;
  }

  getCompletedCount(): number {
    return this.assignedTests().filter(t => t.statut === 'COMPLETED').length;
  }

  getAverageScore(): number {
    const completed = this.assignedTests().filter(t => t.statut === 'COMPLETED' && t.score !== null);
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, current) => acc + (current.score || 0), 0);
    return Math.round(sum / completed.length);
  }
}
