import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TestExecutionService } from '../services/test-execution.service';
import { TestService } from '../services/test.service';
import { TestEmploye, TestTechnique, Question } from '../models/test.model';

@Component({
  selector: 'app-take-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressBarModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="take-test-wrapper" *ngIf="test() as t">
      <!-- FIXED HEADER -->
      <header class="test-header">
        <div class="header-content">
          <div class="test-info">
            <div class="accent-line"></div>
            <div>
              <h1 class="test-title">{{t.titre}}</h1>
              <p class="test-subtitle">{{t.technologie}} • {{totalQuestions()}} Questions</p>
            </div>
          </div>
          
          <div class="timer-card" [class.urgent]="timeRemaining() < 60">
            <div class="timer-icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="timer-values">
              <span class="time">{{formatTime(timeRemaining())}}</span>
              <span class="label">Temps restant</span>
            </div>
          </div>
        </div>
        
        <div class="progress-container">
          <div class="progress-bar" [style.width]="progress() + '%'"></div>
          <span class="progress-text">Progression : {{currentIndex() + 1}} / {{totalQuestions()}}</span>
        </div>
      </header>

      <!-- QUESTION AREA -->
      <main class="question-container">
        <div class="question-card" *ngIf="currentQuestion() as q">
          <div class="card-header">
            <div class="q-badge">Question {{currentIndex() + 1}}</div>
            <div class="points-badge">{{q.points}} pts</div>
          </div>

          <h2 class="question-content">{{q.contenu}}</h2>

          <div class="answer-section">
            <mat-radio-group [(ngModel)]="answers[q.id!]" class="modern-radio-group">
              <!-- QCM Options -->
              <div class="options-grid">
                <div class="option-item" [class.selected]="answers[q.id!] === 'Vrai'">
                  <mat-radio-button value="Vrai">Vrai / Oui</mat-radio-button>
                </div>
                <div class="option-item" [class.selected]="answers[q.id!] === 'Faux'">
                  <mat-radio-button value="Faux">Faux / Non</mat-radio-button>
                </div>
              </div>
              
              <!-- Free Text Option -->
              <div class="text-answer-field" *ngIf="q.typeQuestion === 'TEXTE_LIBRE'">
                <div class="field-label">Votre réponse détaillée</div>
                <textarea 
                  [(ngModel)]="answers[q.id!]" 
                  placeholder="Expliquez votre raisonnement ici..."
                  class="premium-textarea"
                ></textarea>
              </div>
            </mat-radio-group>
          </div>

          <footer class="card-actions">
            <button class="btn-secondary" (click)='previous()' [disabled]="currentIndex() === 0">
              <mat-icon>arrow_back</mat-icon>
              <span>Précédent</span>
            </button>
            
            <div class="spacer"></div>

            <button class="btn-primary" (click)='next()' *ngIf="currentIndex() < totalQuestions() - 1">
              <span>Suivant</span>
              <mat-icon>arrow_forward</mat-icon>
            </button>
            
            <button class="btn-submit" (click)='submit()' *ngIf="currentIndex() === totalQuestions() - 1">
              <mat-icon>task_alt</mat-icon>
              <span>Terminer l'évaluation</span>
            </button>
          </footer>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--text-primary);
      --accent: var(--primary);
      --bg: var(--bg-light);
      --card-bg: rgba(255, 255, 255, 0.9);
      --text: var(--text-primary);
      --muted: var(--text-secondary);
      --border: var(--border-light);
      --error: var(--error);
      --success: var(--success);
    }

    .take-test-wrapper {
      min-height: 100vh;
      background: var(--bg);
      padding: 0 0 4rem 0;
      font-family: 'Inter', sans-serif;
    }

    /* HEADER */
    .test-header {
      background: white;
      border-bottom: 1px solid var(--border);
      padding: 1.5rem 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .header-content {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .test-info { display: flex; gap: 1rem; align-items: center; }
    .accent-line { width: 4px; height: 40px; background: var(--accent); border-radius: 10px; }
    .test-title { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--primary); margin: 0; }
    .test-subtitle { color: var(--muted); font-size: 0.9rem; margin: 0.25rem 0 0; font-weight: 600; }

    .timer-card {
      background: var(--bg-light);
      padding: 0.75rem 1.25rem;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s;
    }
    .timer-card.urgent { background: rgba(218,30,40,0.1); color: var(--error); animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
    
    .timer-icon { color: var(--accent); }
    .timer-card.urgent .timer-icon { color: var(--error); }
    .timer-values { display: flex; flex-direction: column; }
    .time { font-family: 'Sora', sans-serif; font-size: 1.25rem; font-weight: 800; line-height: 1; }
    .label { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; opacity: 0.7; }

    .progress-container { max-width: 1000px; margin: 0 auto; position: relative; height: 8px; background: var(--bg-light); border-radius: 10px; overflow: hidden; }
    .progress-bar { height: 100%; background: var(--accent); transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .progress-text { position: absolute; right: 0; top: -20px; font-size: 0.75rem; font-weight: 700; color: var(--muted); }

    /* QUESTION AREA */
    .question-container {
      max-width: 1000px;
      margin: 3rem auto;
      padding: 0 1rem;
    }
    .question-card {
      background: var(--card-bg);
      backdrop-filter: blur(10px);
      border: 1px solid white;
      border-radius: 32px;
      padding: 3rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);
    }

    .card-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .q-badge { background: rgba(15,98,254,0.1); color: var(--primary); padding: 0.4rem 1rem; border-radius: 10px; font-weight: 800; font-size: 0.8rem; }
    .points-badge { color: var(--muted); font-weight: 700; font-size: 0.9rem; }

    .question-content { font-family: 'Sora', sans-serif; font-size: 1.75rem; font-weight: 700; color: var(--primary); line-height: 1.4; margin-bottom: 2.5rem; }

    .answer-section { margin-bottom: 3rem; }
    .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .option-item {
      border: 2px solid var(--border);
      border-radius: 20px;
      padding: 1.25rem;
      transition: 0.2s;
      cursor: pointer;
    }
    .option-item:hover { border-color: var(--accent); background: #f8fafc; }
    .option-item.selected { border-color: var(--accent); background: rgba(15,98,254,0.05); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.1); }
    
    ::ng-deep .mat-mdc-radio-button { width: 100%; }
    ::ng-deep .mdc-label { font-weight: 700 !important; color: var(--text) !important; font-size: 1.1rem !important; }

    .text-answer-field { margin-top: 2rem; }
    .field-label { font-weight: 800; color: var(--primary); margin-bottom: 0.75rem; font-size: 0.9rem; }
    .premium-textarea {
      width: 100%; min-height: 180px; padding: 1.5rem; border-radius: 20px; border: 2px solid var(--border);
      font-family: 'Inter', sans-serif; font-size: 1rem; transition: 0.2s; resize: vertical;
    }
    .premium-textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

    /* ACTIONS */
    .card-actions { display: flex; align-items: center; border-top: 1px solid var(--border); pt: 2rem; padding-top: 2rem; }
    .spacer { flex: 1; }
    
    .btn-primary, .btn-secondary, .btn-submit {
      padding: 0.8rem 1.75rem; border-radius: 14px; font-weight: 700; display: flex; align-items: center; gap: 0.75rem; 
      cursor: pointer; transition: 0.3s; border: none; font-size: 1rem;
    }
    
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: var(--accent); transform: translateX(5px); }
    
    .btn-secondary { background: transparent; color: var(--muted); border: 1px solid var(--border); }
    .btn-secondary:hover:not(:disabled) { background: var(--bg-light); color: var(--primary); }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-submit { background: var(--success); color: white; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2); }
    .btn-submit:hover { background: var(--success); transform: scale(1.05); }

    @media (max-width: 768px) {
      .options-grid { grid-template-columns: 1fr; }
      .question-card { padding: 1.5rem; }
      .test-header { padding: 1rem; }
      .test-title { font-size: 1.25rem; }
    }
  `]
})
export class TakeTestComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private executionService = inject(TestExecutionService);
  private testService = inject(TestService);

  testEmployeId: string | null = null;
  test = signal<TestTechnique | null>(null);
  currentIndex = signal(0);
  answers: { [key: string]: string } = {};

  timeRemaining = signal(0);
  timerInterval: any;

  currentIndexSignal = signal(0);

  currentQuestion = () => this.test()?.questions?.[this.currentIndex()];
  totalQuestions = () => this.test()?.questions?.length || 0;
  progress = () => (this.currentIndex() + 1) / this.totalQuestions() * 100;

  ngOnInit(): void {
    this.testEmployeId = this.route.snapshot.paramMap.get('id');
    console.log('Démarrage du test pour l\'assignation:', this.testEmployeId);

    if (this.testEmployeId) {
      this.executionService.startTest(this.testEmployeId).subscribe({
        next: (te) => {
          console.log('Données d\'assignation reçues:', te);
          if (te.testId) {
            console.log('Récupération des détails du test ID:', te.testId);
            this.testService.getTestById(te.testId).subscribe({
              next: (t) => {
                console.log('Détails du test chargés avec succès:', t);
                this.test.set(t);
                this.timeRemaining.set(t.dureeMinutes * 60);
                this.startTimer();
              },
              error: (err) => console.error('Erreur lors de la récupération des détails du test:', err)
            });
          } else {
            console.error('Aucun testId trouvé dans l\'assignation');
          }
        },
        error: (err) => console.error('Erreur lors du démarrage du test:', err)
      });
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeRemaining.update(v => v - 1);
      if (this.timeRemaining() <= 0) {
        this.submit();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  next() {
    if (this.currentIndex() < this.totalQuestions() - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  previous() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  submit() {
    if (this.testEmployeId) {
      this.executionService.submitTest(this.testEmployeId, this.answers).subscribe({
        next: () => this.router.navigate(['/employe/tests', this.testEmployeId, 'result']),
        error: (err) => console.error(err)
      });
    }
  }
}
