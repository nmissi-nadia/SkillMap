import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { TestService } from '../services/test.service';
import { TestTechnique } from '../models/test.model';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-layout">
      <!-- DASHBOARD HEADER -->
      <header class="dashboard-header">
        <div class="title-group">
          <div class="accent-pill"></div>
          <div>
            <h1>Bibliothèque de Tests</h1>
            <p>Concevez et gérez vos évaluations techniques avec précision.</p>
          </div>
        </div>

        <button class="btn-primary" routerLink="/tests/create">
          <mat-icon>add</mat-icon>
          <span>Nouveau Test</span>
        </button>
      </header>

      <!-- ANALYTICS SHELF -->
      <section class="analytics-grid">
        <div class="stat-card" *ngFor="let stat of getStats()">
          <div class="stat-icon-wrap" [style.background]="stat.bg">
            <mat-icon [style.color]="stat.color">{{stat.icon}}</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-num">{{stat.value}}</span>
            <span class="stat-desc">{{stat.label}}</span>
          </div>
        </div>
      </section>

      <!-- SEARCH & FILTERS -->
      <section class="control-panel">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            placeholder="Rechercher un test, une tech..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
          <button *ngIf="searchQuery()" (click)="searchQuery.set('')" class="btn-clear">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="filter-chips">
          <button
            *ngFor="let level of ['','DEBUTANT','INTERMEDIAIRE','AVANCE']"
            class="chip"
            [class.active]="selectedLevel() === level"
            (click)="selectedLevel.set(level)"
          >
            {{level || 'Tous'}}
          </button>
        </div>
      </section>

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <div *ngIf="loading()" class="loader-wrap">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Chargement de la bibliothèque...</span>
        </div>

        <div *ngIf="!loading() && filteredTests().length > 0" class="test-grid">
          <div
            *ngFor="let test of filteredTests()"
            class="test-card"
            [routerLink]="['/tests', test.id]"
          >
            <div class="card-top">
              <span class="level-badge" [ngClass]="test.niveau?.toLowerCase() || 'default'">
                {{test.niveau || 'Standard'}}
              </span>
              <span class="tech-tag">{{test.technologie || 'Générique'}}</span>
            </div>

            <h3 class="test-title">{{test.titre}}</h3>
            <p class="test-desc">{{test.description}}</p>

            <div class="card-meta">
              <div class="meta-item">
                <mat-icon>timer</mat-icon>
                <span>{{test.dureeMinutes}} min</span>
              </div>
              <div class="meta-item">
                <mat-icon>analytics</mat-icon>
                <span>{{test.questions?.length || 0}} Qs</span>
              </div>
            </div>

            <div class="card-actions" (click)="$event.stopPropagation()">
              <button mat-icon-button class="btn-action" [routerLink]="['/tests/assign', test.id]" matTooltip="Assigner">
                <mat-icon>assignment_ind</mat-icon>
              </button>
              <button mat-icon-button class="btn-action" color="primary" [routerLink]="['/tests/edit', test.id]" matTooltip="Modifier">
                <mat-icon>edit_note</mat-icon>
              </button>
              <button mat-icon-button class="btn-action" color="warn" (click)="test.id && deleteTest(test.id)" matTooltip="Supprimer">
                <mat-icon>delete_sweep</mat-icon>
              </button>
            </div>

            <div class="difficulty-bar">
              <div class="progress" [style.width]="difficultyValue(test.niveau) + '%'" [ngClass]="test.niveau?.toLowerCase() || 'default'"></div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading() && filteredTests().length === 0" class="empty-state">
          <div class="empty-icon">
            <mat-icon>search_off</mat-icon>
          </div>
          <h2>Aucun test trouvé</h2>
          <p>Ajustez vos filtres ou créez une nouvelle évaluation.</p>
          <button mat-stroked-button (click)="resetFilters()">Voir tout</button>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
    }
    .title-group { display: flex; align-items: center; gap: 1.25rem; }
    .accent-pill { width: 5px; height: 50px; background: var(--accent); border-radius: 10px; }
    .title-group h1 { font-family: 'Sora', sans-serif; font-size: 2.25rem; font-weight: 800; color: var(--primary); margin: 0; letter-spacing: -0.03em; }
    .title-group p { color: var(--muted); font-size: 1rem; margin: 0; }

    .btn-primary {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }

    /* ANALYTICS */
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .stat-card {
      background: var(--card-bg);
      padding: 1.5rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .stat-card:hover { border-color: var(--accent); transform: translateY(-3px); }
    .stat-icon-wrap { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .stat-icon-wrap mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .stat-num { display: block; font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--primary); }
    .stat-desc { font-size: 0.8rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }

    /* CONTROL PANEL */
    .control-panel {
      background: white;
      padding: 0.75rem;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      border: 1px solid var(--border);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
    }
    .search-box { flex: 1; display: flex; align-items: center; gap: 0.75rem; padding: 0 1rem; position: relative; }
    .search-icon { color: var(--muted); font-size: 20px; width: 20px; height: 20px; }
    .search-box input { border: none; outline: none; width: 100%; font-size: 0.95rem; font-weight: 500; color: var(--primary); }
    .btn-clear { background: none; border: none; cursor: pointer; color: var(--muted); padding: 0.2rem; display: flex; }

    .filter-chips { display: flex; gap: 0.5rem; padding-right: 0.5rem; }
    .chip {
      border: none;
      background: #f1f5f9;
      color: var(--muted);
      padding: 0.5rem 1rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .chip.active { background: var(--accent); color: white; }

    /* GRID & CARDS */
    .test-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    .test-card {
      background: white;
      border-radius: 24px;
      padding: 1.75rem;
      border: 1px solid var(--border);
      cursor: pointer;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }
    .test-card:hover { border-color: var(--accent); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }

    .card-top { display: flex; justify-content: space-between; margin-bottom: 1.25rem; }
    .level-badge { font-family: 'DM Mono', monospace; font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px; text-transform: uppercase; }
    .level-badge.debutant { background: rgba(36,161,72,0.1); color: #10B981; }
    .level-badge.intermediaire { background: rgba(0,67,206,0.1); color: #3b82f6; }
    .level-badge.avance { background: rgba(218,30,40,0.1); color: #f43f5e; }
    .level-badge.default { background: var(--bg-light); color: var(--text-secondary); }
    .tech-tag { font-size: 0.7rem; font-weight: 700; color: var(--muted); }

    .test-title { font-family: 'Sora', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--primary); margin: 0 0 0.75rem; }
    .test-desc { color: var(--muted); font-size: 0.88rem; line-height: 1.5; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.7em; }

    .card-meta { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .meta-item { display: flex; align-items: center; gap: 0.4rem; color: var(--muted); font-size: 0.8rem; font-weight: 600; }
    .meta-item mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.25rem;
      border-top: 1px solid #f1f5f9;
      padding-top: 1rem;
      margin-top: auto;
    }
    .btn-action { transform: scale(0.85); background: var(--bg-light); border-radius: 10px; }
    .btn-action:hover { background: #f1f5f9; transform: scale(1); }

    .difficulty-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #f1f5f9; overflow: hidden; border-radius: 0 0 24px 24px; }
    .progress { height: 100%; transition: width 0.8s ease-in-out; }
    .progress.debutant { background: #10B981; }
    .progress.intermediaire { background: #3b82f6; }
    .progress.avance { background: #f43f5e; }
    .progress.default { background: var(--border-light); }

    .loader-wrap, .empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 6rem 0; color: var(--muted); }
    .empty-icon { font-size: 3rem; width: 3rem; height: 3rem; opacity: 0.3; }
    .empty-state h2 { color: var(--primary); margin: 0; }

    @media (max-width: 768px) {
      .page-layout { padding: 1.5rem; }
      .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .control-panel { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class TestListComponent implements OnInit {

  private testService = inject(TestService);
  private snackBar = inject(MatSnackBar);

  allTests = signal<TestTechnique[]>([]);
  searchQuery = signal('');
  selectedLevel = signal('');
  loading = signal(true);

  getStats() {
    return [
      { label: 'Total des Tests', value: this.allTests().length, icon: 'quiz', color: 'var(--primary)', bg: '#e0e7ff' },
      { label: 'Débutants', value: this.countByLevel('DEBUTANT'), icon: 'school', color: '#10B981', bg: '#dcfce7' },
      { label: 'Intermédiaires', value: this.countByLevel('INTERMEDIAIRE'), icon: 'trending_up', color: '#3b82f6', bg: '#dbeafe' },
      { label: 'Avancés', value: this.countByLevel('AVANCE'), icon: 'stars', color: '#f43f5e', bg: '#ffe4e6' }
    ];
  }

  filteredTests = computed(() =>
    this.allTests().filter(t => {

      const search = this.searchQuery().toLowerCase();

      const matchSearch =
        (t.titre?.toLowerCase()?.includes(search) || false) ||
        (t.technologie?.toLowerCase()?.includes(search) || false) ||
        (t.niveau?.toLowerCase()?.includes(search) || false);

      const matchLevel =
        !this.selectedLevel() || t.niveau === this.selectedLevel();

      return matchSearch && matchLevel;

    })
  );

  ngOnInit() {
    this.loadTests();
  }

  loadTests() {

    this.loading.set(true);

    this.testService.getAllTests().subscribe({
      next: data => {
        this.allTests.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

  }

  countByLevel(level: string) {
    return this.allTests().filter(t => t.niveau === level).length;
  }

  difficultyValue(level: string|undefined) {
    if (!level) return 0;
    switch (level.toUpperCase()) {
      case 'DEBUTANT': return 33;
      case 'INTERMEDIAIRE': return 66;
      case 'AVANCE': return 100;
      default: return 0;
    }
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedLevel.set('');
  }

  deleteTest(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce test ? Cette action est irréversible.')) {
      this.testService.deleteTest(id).subscribe({
        next: () => {
          this.snackBar.open('Test supprimé avec succès', 'OK', { duration: 3000 });
          this.loadTests();
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 5000 });
        }
      });
    }
  }

}
