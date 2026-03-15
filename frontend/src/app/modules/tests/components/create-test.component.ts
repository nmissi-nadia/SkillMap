import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { TestService } from '../services/test.service';
import { QuestionType } from '../models/test.model';
import { RhService } from '../../../core/services/rh.service';

@Component({
    selector: 'app-create-test',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatCardModule,
        MatSnackBarModule,
        MatDividerModule
    ],
    template: `
    <div class="create-test-container">
      <div class="header">
        <h1>Créer un Nouveau Test Technique</h1>
        <button mat-button routerLink="/tests">Annuler</button>
      </div>

      <form [formGroup]="testForm" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-2">
                <mat-label>Titre du Test</mat-label>
                <input matInput formControlName="titre" placeholder="Ex: Java Spring Boot - Fondamentaux">
                <mat-error *ngIf="testForm.get('titre')?.hasError('required')">Le titre est requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Durée (minutes)</mat-label>
                <input matInput type="number" formControlName="dureeMinutes">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Compétence liée</mat-label>
                <mat-select formControlName="competenceId">
                  <mat-option *ngFor="let comp of competencies()" [value]="comp.id">
                    {{comp.nom}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Niveau cible</mat-label>
                <mat-select formControlName="niveau">
                  <mat-option value="JUNIOR">Junior</mat-option>
                  <mat-option value="CONFIRME">Confirmé</mat-option>
                  <mat-option value="SENIOR">Senior</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <div class="questions-header">
          <h2>Questions</h2>
          <button type="button" mat-stroked-button color="primary" (click)="addQuestion()">
            <mat-icon>add</mat-icon> Ajouter une Question
          </button>
        </div>

        <div formArrayName="questions">
          <div *ngFor="let qGroup of questions.controls; let i=index" [formGroupName]="i" class="question-card">
            <mat-card>
              <mat-card-header>
                <div mat-card-avatar class="question-number">{{i + 1}}</div>
                <mat-card-title>Question {{i + 1}}</mat-card-title>
                <div class="spacer"></div>
                <button type="button" mat-icon-button color="warn" (click)="removeQuestion(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="flex-3">
                    <mat-label>Énoncé de la question</mat-label>
                    <input matInput formControlName="contenu">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Points</mat-label>
                    <input matInput type="number" formControlName="points">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Type</mat-label>
                    <mat-select formControlName="typeQuestion">
                      <mat-option value="QCM">QCM</mat-option>
                      <mat-option value="VRAI_FAUX">Vrai/Faux</mat-option>
                      <mat-option value="TEXTE_LIBRE">Texte Libre</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-2">
                    <mat-label>Bonne Réponse</mat-label>
                    <input matInput formControlName="bonneReponse" placeholder="La réponse exacte attendue">
                    <mat-hint>Utilisée pour l'auto-correction</mat-hint>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="testForm.invalid || questions.length === 0">
            Enregistrer le Test
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .create-test-container {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .flex-3 { flex: 3; }
    .full-width { width: 100%; }
    .questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 2rem 0 1rem;
    }
    .question-card {
      margin-bottom: 1.5rem;
    }
    .question-number {
      background-color: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .spacer { flex: 1 1 auto; }
    .actions {
      margin-top: 3rem;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class CreateTestComponent {
    private fb = inject(FormBuilder);
    private testService = inject(TestService);
    private rhService = inject(RhService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    competencies = signal<any[]>([]);

    testForm: FormGroup = this.fb.group({
        titre: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', Validators.required],
        competenceId: ['', Validators.required],
        dureeMinutes: [30, [Validators.required, Validators.min(1)]],
        niveau: ['JUNIOR', Validators.required],
        questions: this.fb.array([])
    });

    get questions() {
        return this.testForm.get('questions') as FormArray;
    }

    constructor() {
        this.loadCompetencies();
        this.addQuestion(); // Commencer avec une question
    }

    loadCompetencies() {
        this.rhService.getAllCompetencies().subscribe(data => this.competencies.set(data));
    }

    addQuestion() {
        const qGroup = this.fb.group({
            contenu: ['', Validators.required],
            typeQuestion: ['QCM', Validators.required],
            bonneReponse: ['', Validators.required],
            points: [10, [Validators.required, Validators.min(1)]]
        });
        this.questions.push(qGroup);
    }

    removeQuestion(index: number) {
        this.questions.removeAt(index);
    }

    onSubmit() {
        if (this.testForm.valid) {
            this.testService.createTest(this.testForm.value).subscribe({
                next: () => {
                    this.snackBar.open('Test créé avec succès !', 'Fermer', { duration: 3000 });
                    this.router.navigate(['/tests']);
                },
                error: (err) => {
                    this.snackBar.open('Erreur lors de la création du test.', 'Fermer', { duration: 3000 });
                    console.error(err);
                }
            });
        }
    }
}
