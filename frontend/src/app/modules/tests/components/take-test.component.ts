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
    <div class="take-test-container" *ngIf="test() as t">
      <div class="test-header">
        <div class="title-section">
          <h1>{{t.titre}}</h1>
          <div class="timer" [class.urgent]="timeRemaining() < 60">
            <mat-icon>timer</mat-icon>
            <span>{{formatTime(timeRemaining())}}</span>
          </div>
        </div>
        <mat-progress-bar mode="determinate" [value]="progress()"></mat-progress-bar>
      </div>

      <div class="question-section" *ngIf="currentQuestion() as q">
        <mat-card>
          <mat-card-header>
            <div mat-card-avatar class="q-number">{{currentIndex() + 1}}</div>
            <mat-card-title>Question {{currentIndex() + 1}} / {{totalQuestions()}}</mat-card-title>
            <mat-card-subtitle>{{q.points}} points</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p class="question-text">{{q.contenu}}</p>
            
            <div class="answer-box">
              <mat-radio-group [(ngModel)]="answers[q.id!]">
                <!-- Simulation d'options pour QCM si non présentes branchées sur Vrai/Faux par défaut ou input -->
                <mat-radio-button value="Oui" class="option">Vrai / Oui</mat-radio-button>
                <mat-radio-button value="Non" class="option">Faux / Non</mat-radio-button>
                
                <div class="text-answer" *ngIf="q.typeQuestion === 'TEXTE_LIBRE'">
                   <textarea class="custom-textarea" [(ngModel)]="answers[q.id!]" placeholder="Saisissez votre réponse ici..."></textarea>
                </div>
              </mat-radio-group>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button (click)="previous()" [disabled]="currentIndex() === 0">Précédent</button>
            <button mat-raised-button color="primary" (click)="next()" *ngIf="currentIndex() < totalQuestions() - 1">Suivant</button>
            <button mat-raised-button color="warn" (click)="submit()" *ngIf="currentIndex() === totalQuestions() - 1">Terminer & Soumettre</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .take-test-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .test-header {
      margin-bottom: 2rem;
      position: sticky;
      top: 0;
      background: var(--background);
      z-index: 10;
      padding: 1rem 0;
    }
    .title-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .timer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary);
      padding: 0.5rem 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
    }
    .timer.urgent { color: var(--error); animation: pulse 1s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    .q-number {
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: bold;
    }
    .question-text {
      font-size: 1.2rem;
      margin: 2rem 0;
    }
    .option {
      display: block;
      margin-bottom: 1rem;
    }
    .text-answer { margin-top: 1rem; }
    .custom-textarea {
      width: 100%;
      height: 150px;
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      resize: none;
    }
    mat-progress-bar { border-radius: 4px; height: 8px; }
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
        if (this.testEmployeId) {
            this.executionService.startTest(this.testEmployeId).subscribe(te => {
                if (te.test?.id) {
                    this.testService.getTestById(te.test.id).subscribe(t => {
                        this.test.set(t);
                        this.timeRemaining.set(t.dureeMinutes * 60);
                        this.startTimer();
                    });
                }
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
