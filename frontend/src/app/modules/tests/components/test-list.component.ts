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
      <section class="dashboard-header">
        <div class="title-container">
          <div class="accent-line"></div>
          <div>
            <h1>Bibliothèque de Tests</h1>
            <p>Concevez, gérez et déployez des évaluations techniques pour vos équipes.</p>
          </div>
        </div>

        <div class="header-actions">
          <button mat-flat-button class="btn-create" routerLink="/tests/create">
            <mat-icon>add_circle</mat-icon>
            <span>Créer un Test</span>
          </button>
        </div>
      </section>

      <!-- ANALYTICS OVERVIEW -->
      <section class="analytics-shelf">
        <div class="analytics-card" *ngFor="let stat of getStats()">
          <div class="stat-icon" [style.background]="stat.bg">
            <mat-icon [style.color]="stat.color">{{stat.icon}}</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{stat.value}}</span>
            <span class="stat-label">{{stat.label}}</span>
          </div>
        </div>
      </section>

      <!-- SEARCH & DISCOVERY -->
      <section class="discovery-bar">
        <div class="search-wrapper">
          <mat-icon>search</mat-icon>
          <input
            type="text"
            placeholder="Rechercher par titre, technologie ou niveau..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
          <button *ngIf="searchQuery()" (click)="searchQuery.set('')" class="clear-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="filter-group">
          <button
            *ngFor="let level of ['','JUNIOR','CONFIRME','SENIOR','EXPERT']"
            class="filter-chip"
            [class.active]="selectedLevel() === level"
            (click)="selectedLevel.set(level)"
          >
            {{level || 'Tous les Niveaux'}}
          </button>
        </div>
      </section>

      <!-- CONTENT AREA -->
      <main class="content-overflow">
        <div *ngIf="loading()" class="state-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Analyse de la bibliothèque...</p>
        </div>

        <div *ngIf="!loading() && filteredTests().length > 0" class="test-grid">
          <div
            *ngFor="let test of filteredTests()"
            class="premium-card"
            [routerLink]="['/tests', test.id]"
          >
            <div class="card-status">
              <span class="badge" [class]="test.niveau?.toLowerCase() || 'default'">
                {{test.niveau || 'Standard'}}
              </span>
              <span class="tech-label">{{test.technologie || 'Tech Mixte'}}</span>
            </div>

            <h3 class="card-title">{{test.titre}}</h3>
            <p class="card-excerpt">{{test.description}}</p>

            <div class="card-footer">
              <div class="metrics">
                <div class="metric">
                  <mat-icon>schedule</mat-icon>
                  <span>{{test.dureeMinutes}}m</span>
                </div>
                <div class="metric">
                  <mat-icon>quiz</mat-icon>
                  <span>{{test.questions.length || 0}} Questions</span>
                </div>
              </div>

              <div class="action-row">
                <button mat-icon-button (click)="$event.stopPropagation()" [routerLink]="['/tests/assign', test.id]" matTooltip="Assigner à un candidat">
                  <mat-icon>person_add</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="$event.stopPropagation()" [routerLink]="['/tests/edit', test.id]" matTooltip="Modifier le test">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="$event.stopPropagation(); deleteTest(test.id)" matTooltip="Supprimer le test">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <div class="difficulty-track">
              <div class="level-indicator" [style.width]="difficultyValue(test.niveau) + '%'" [class]="test.niveau ? test.niveau.toLowerCase() : ''"></div>
            </div>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div *ngIf="!loading() && filteredTests().length === 0" class="state-container empty-state">
          <div class="empty-art">
            <mat-icon>cloud_off</mat-icon>
          </div>
          <h3>Aucun résultat trouvé</h3>
          <p>Nous n'avons trouvé aucun test correspondant à vos filtres actuels.</p>
          <button mat-button color="primary" (click)="resetFilters()">Réinitialiser les filtres</button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { --brand: #4f46e5; --brand-light: #818cf8; --bg: #f8fafc; --text-main: #0f172a; --text-muted: #64748b; }

    .page-layout { padding: 3rem 4rem; max-width: 1600px; margin: 0 auto; background: var(--bg); min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }

    /* HEADER */
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3.5rem; }
    .title-container { display: flex; align-items: center; gap: 1.5rem; }
    .accent-line { width: 6px; height: 60px; background: var(--brand); border-radius: 99px; }
    .title-container h1 { font-size: 2.75rem; font-weight: 900; color: var(--text-main); margin: 0; letter-spacing: -0.04em; }
    .title-container p { color: var(--text-muted); font-size: 1.1rem; margin: 0; }
    .btn-create { background: var(--brand) !important; color: white !important; padding: 0.8rem 2rem; border-radius: 14px; font-weight: 700; transition: all 0.3s ease; height: auto; }
    .btn-create:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(79, 70, 229, 0.25); }

    /* ANALYTICS */
    .analytics-shelf { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-bottom: 4rem; }
    .analytics-card { background: white; padding: 1.75rem; border-radius: 24px; display: flex; align-items: center; gap: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
    .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .stat-value { display: block; font-size: 1.75rem; font-weight: 800; color: var(--text-main); }
    .stat-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    /* DISCOVERY */
    .discovery-bar { background: white; padding: 1rem; border-radius: 20px; display: flex; align-items: center; gap: 2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); margin-bottom: 3rem; border: 1px solid #f1f5f9; }
    .search-wrapper { flex: 1; display: flex; align-items: center; gap: 1rem; padding: 0 1rem; }
    .search-wrapper mat-icon { color: var(--text-muted); }
    .search-wrapper input { border: none; outline: none; width: 100%; font-size: 1rem; font-weight: 500; color: var(--text-main); background: transparent; }
    .clear-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 0; }

    .filter-group { display: flex; gap: 0.75rem; padding-right: 1rem; }
    .filter-chip { border: none; background: #f1f5f9; color: var(--text-muted); padding: 0.6rem 1.25rem; border-radius: 12px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s ease; }
    .filter-chip.active { background: var(--brand); color: white; }

    /* CONTENT */
    .test-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 2.5rem; }
    .premium-card { background: white; border-radius: 32px; padding: 2rem; border: 1px solid #f1f5f9; cursor: pointer; position: relative; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
    .premium-card:hover { transform: translateY(-12px); box-shadow: 0 40px 60px -20px rgba(0,0,0,0.1); border-color: var(--brand-light); }

    .card-status { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    .badge { font-size: 0.65rem; font-weight: 900; padding: 0.3rem 0.8rem; border-radius: 8px; text-transform: uppercase; }
    .badge.junior { background: #dcfce7; color: #065f46; }
    .badge.senior { background: #fee2e2; color: #991b1b; }
    .badge.expert { background: #fae8ff; color: #701a75; }
    .badge.default { background: #f1f5f9; color: #475569; }
    .tech-label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); background: #f8fafc; padding: 0.3rem 0.8rem; border-radius: 8px; }

    .card-title { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin: 0 0 1rem; line-height: 1.3; }
    .card-excerpt { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin: 0 0 2rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; height: 4.8em; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .metrics { display: flex; gap: 1.25rem; }
    .metric { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }
    .metric mat-icon { font-size: 1.25rem; width: 1.25rem; height: 1.25rem; }

    .action-row { display: flex; gap: 0.25rem; }

    .difficulty-track { height: 4px; background: #f1f5f9; border-radius: 99px; margin-top: 1.5rem; overflow: hidden; }
    .track-fill { height: 100%; border-radius: 99px; transition: width 1s ease-out; }
    .track-fill.junior { background: #10b981; }
    .track-fill.senior { background: #ef4444; }
    .track-fill.expert { background: #d946ef; }
    .track-fill.default { background: #cbd5e1; }

    .state-container { display: flex; flex-direction: column; align-items: center; padding: 8rem; text-align: center; color: var(--text-muted); }
    .empty-state h3 { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin: 1.5rem 0 0.5rem; }
    .empty-art mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #cbd5e1; }

    @media (max-width: 1000px) {
      .page-layout { padding: 2rem; }
      .analytics-shelf { grid-template-columns: repeat(2, 1fr); }
      .dashboard-header { flex-direction: column; align-items: flex-start; gap: 2rem; }
    }
  `]
})
export class TestListComponent implements OnInit {

  private testService = inject(TestService);
  private snackBar = inject(import('@angular/material/snack-bar').MatSnackBar);

  allTests = signal<TestTechnique[]>([]);
  searchQuery = signal('');
  selectedLevel = signal('');
  loading = signal(true);

  getStats() {
    return [
      { label: 'Total des Tests', value: this.allTests().length, icon: 'quiz', color: '#6366f1', bg: '#e0e7ff' },
      { label: 'Niveau Junior', value: this.countByLevel('JUNIOR'), icon: 'school', color: '#10b981', bg: '#dcfce7' },
      { label: 'Experts Senior', value: this.countByLevel('SENIOR'), icon: 'stars', color: '#f59e0b', bg: '#fef3c7' },
      { label: 'Difficulté Max', value: this.countByLevel('EXPERT'), icon: 'psychology', color: '#d946ef', bg: '#fae8ff' }
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

  difficultyValue(level: string) {

    switch (level) {
      case 'JUNIOR': return 25;
      case 'CONFIRME': return 50;
      case 'SENIOR': return 75;
      case 'EXPERT': return 100;
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

}