import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TestService } from '../services/test.service';
import { RhService } from '../../../core/services/rh.service';
import { TestTechnique } from '../models/test.model';
import { CompetenceDTO } from '../../../core/services/rh.service';

@Component({
    selector: 'app-edit-test',
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
        MatSnackBarModule,
        MatTooltipModule
    ],
    template: `
    <div class="shell">
      <!-- TOP NAV -->
      <nav class="topnav">
        <div class="nav-brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="var(--bg-dark)"/>
            <path d="M8 20 L14 8 L20 20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="14" cy="14" r="2" fill="var(--success)"/>
          </svg>
          <span class="nav-title">Modifier l'Évaluation</span>
        </div>

        <div class="nav-steps">
          <div class="step-dot" [class.active]="activeStep === 0" (click)="goToStep(0)">
            <span class="dot-num">1</span>
            <span class="dot-label">Configuration</span>
          </div>
          <div class="step-line" [class.done]="activeStep > 0"></div>
          <div class="step-dot" [class.active]="activeStep === 1" (click)="goToStep(1)">
            <span class="dot-num">2</span>
            <span class="dot-label">Questions</span>
          </div>
        </div>

        <button class="btn-cancel" routerLink="/tests">Annuler</button>
      </nav>

      <div class="page-body">
        <form [formGroup]="testForm">
          <!-- STEP 1: CONFIG -->
          <div class="step-panel" *ngIf="activeStep === 0" formGroupName="config">
            <h1 class="step-heading">Modifier les réglages globaux</h1>
            
            <div class="form-grid">
              <div class="field full">
                <label class="flabel">TITRE</label>
                <input class="finput lg" formControlName="titre"/>
              </div>
              <div class="field">
                <label class="flabel">TECHNOLOGIE</label>
                <input class="finput" formControlName="technologie"/>
              </div>
              <div class="field">
                <label class="flabel">COMPÉTENCE</label>
                <select class="fselect" formControlName="competenceId">
                  <option *ngFor="let c of competencies()" [value]="c.id">{{c.nom}}</option>
                </select>
              </div>
              <div class="field full">
                <label class="flabel">NIVEAU</label>
                <div class="level-strip">
                  <button type="button" class="lvl" [class.active]="configGroup.get('niveau')?.value === 'JUNIOR'" (click)="setLevel('JUNIOR')">Junior</button>
                  <button type="button" class="lvl" [class.active]="configGroup.get('niveau')?.value === 'CONFIRME'" (click)="setLevel('CONFIRME')">Confirmé</button>
                  <button type="button" class="lvl" [class.active]="configGroup.get('niveau')?.value === 'SENIOR'" (click)="setLevel('SENIOR')">Senior</button>
                  <button type="button" class="lvl" [class.active]="configGroup.get('niveau')?.value === 'EXPERT'" (click)="setLevel('EXPERT')">Expert</button>
                </div>
              </div>
              <div class="field narrow">
                <label class="flabel">DURÉE (min)</label>
                <input class="finput" type="number" formControlName="dureeMinutes"/>
              </div>
              <div class="field full">
                <label class="flabel">DESCRIPTION</label>
                <textarea class="ftextarea" formControlName="description" rows="4"></textarea>
              </div>
            </div>

            <div class="step-footer">
              <button type="button" class="btn-primary" (click)="goToStep(1)">Gérer les questions ({{questions.length}})</button>
            </div>
          </div>

          <!-- STEP 2: QUESTIONS -->
          <div class="step-panel" *ngIf="activeStep === 1">
            <h1 class="step-heading">Gérer les questions</h1>
            <div class="qlist" formArrayName="questions">
              <div *ngFor="let qg of questions.controls; let i = index" [formGroupName]="i" class="qcard">
                <div class="qcard-head">
                  <span class="qcard-num">#{{i+1}}</span>
                  <div class="qtype-pills">
                    <button type="button" class="tpill" [class.on]="qg.get('typeQuestion')?.value==='QCM'" (click)="setQType(i,'QCM')">QCM</button>
                    <button type="button" class="tpill" [class.on]="qg.get('typeQuestion')?.value==='VRAI_FAUX'" (click)="setQType(i,'VRAI_FAUX')">Vrai/Faux</button>
                  </div>
                  <button type="button" class="btn-del" (click)="removeQuestion(i)"><mat-icon>delete</mat-icon></button>
                </div>
                <div class="qcard-body">
                  <textarea class="ftextarea sm" formControlName="contenu" placeholder="Énoncé..."></textarea>
                  <div class="qcard-bottom">
                    <input class="finput" formControlName="bonneReponse" placeholder="Réponse correcte"/>
                    <input class="finput" type="number" formControlName="points" placeholder="Points" style="width: 80px"/>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" class="btn-add-q" (click)="addQuestion()">+ Ajouter une question</button>

            <div class="step-footer">
               <button type="button" class="btn-ghost" (click)="goToStep(0)">Paramètres</button>
               <button type="button" class="btn-submit" (click)="onSubmit()">Enregistrer les modifications</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    /* Réutilisation simplifiée des styles de CreateTestComponent */
    .shell { min-height: 100vh; background: #f5f3ef; font-family: 'Sora', sans-serif; }
    .topnav { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 60px; background: white; border-bottom: 1px solid #e5e0d8; position: sticky; top: 0; z-index: 10; }
    .nav-brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; }
    .nav-steps { display: flex; align-items: center; gap: 1rem; }
    .step-dot { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .dot-num { width: 20px; height: 20px; border-radius: 50%; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; }
    .active .dot-num { background: #000; color: #fff; }
    .page-body { max-width: 800px; margin: 0 auto; padding: 3rem 1.5rem; }
    .step-heading { font-size: 2rem; margin-bottom: 2rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full { grid-column: 1 / -1; }
    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    .flabel { font-size: 0.7rem; color: #666; font-weight: 600; }
    .finput, .fselect, .ftextarea { padding: 0.6rem; border: 1px solid #ccc; border-radius: 8px; font-size: 0.9rem; }
    .ftextarea { min-height: 80px; }
    .level-strip { display: flex; gap: 0.4rem; }
    .lvl { flex: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 8px; background: #fff; cursor: pointer; }
    .lvl.active { background: #000; color: #fff; }
    .qlist { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .qcard { background: #fff; border: 1px solid #e5e0d8; border-radius: 12px; }
    .qcard-head { padding: 0.5rem 1rem; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 1rem; background: #fafafa; }
    .qcard-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .qcard-bottom { display: flex; gap: 0.5rem; }
    .btn-add-q { width: 100%; padding: 0.8rem; border: 1px dashed #ccc; background: transparent; cursor: pointer; border-radius: 12px; margin-bottom: 2rem; font-weight: 600; }
    .step-footer { display: flex; justify-content: space-between; gap: 1rem; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem; }
    .btn-primary, .btn-submit { padding: 0.8rem 1.5rem; border-radius: 99px; cursor: pointer; border: none; font-weight: 700; }
    .btn-primary { background: #000; color: #fff; }
    .btn-submit { background: var(--success); color: #fff; }
    .btn-ghost { padding: 0.8rem 1.5rem; background: transparent; border: 1px solid #ccc; border-radius: 99px; cursor: pointer; }
    .tpill { padding: 0.2rem 0.6rem; border-radius: 99px; border: 1px solid #ccc; background: #fff; font-size: 0.7rem; cursor: pointer; }
    .tpill.on { background: #000; color: #fff; }
    .btn-del { border: none; background: transparent; color: var(--error); cursor: pointer; }
  `]
})
export class EditTestComponent implements OnInit {
    private fb = inject(FormBuilder);
    private testService = inject(TestService);
    private rhService = inject(RhService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);

    testId: string | null = null;
    competencies = signal<CompetenceDTO[]>([]);
    activeStep = 0;

    testForm = this.fb.group({
        id: [''],
        config: this.fb.group({
            titre: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', Validators.required],
            competenceId: ['', Validators.required],
            technologie: [''],
            dureeMinutes: [30, [Validators.required, Validators.min(1)]],
            niveau: ['JUNIOR', Validators.required]
        }),
        questions: this.fb.array<FormGroup>([])
    });

    get configGroup() { return this.testForm.get('config') as FormGroup; }
    get questions() { return this.testForm.controls.questions; }

    ngOnInit() {
        this.testId = this.route.snapshot.paramMap.get('id');
        this.loadCompetencies();
        if (this.testId) {
            this.loadTestData(this.testId);
        }
    }

    loadCompetencies() {
        this.rhService.getCompetencies().subscribe((data: any[]) => this.competencies.set(data));
    }

    loadTestData(id: string) {
        this.testService.getTestById(id).subscribe({
            next: (test: TestTechnique) => {
                this.testForm.patchValue({
                    id: test.id,
                    config: {
                        titre: test.titre,
                        description: test.description,
                        competenceId: test.competenceId,
                        technologie: test.technologie,
                        dureeMinutes: test.dureeMinutes,
                        niveau: test.niveau || 'JUNIOR'
                    }
                });

                // Load questions
                this.questions.clear();
                test.questions.forEach(q => {
                    this.questions.push(this.fb.group({
                        id: [q.id],
                        contenu: [q.contenu, Validators.required],
                        typeQuestion: [q.typeQuestion, Validators.required],
                        bonneReponse: [q.bonneReponse, Validators.required],
                        points: [q.points, [Validators.required, Validators.min(1)]]
                    }));
                });
            },
            error: () => this.snackBar.open('Erreur lors du chargement des données', 'OK')
        });
    }

    goToStep(n: number) { this.activeStep = n; }
    setLevel(val: string) { this.configGroup.get('niveau')?.setValue(val); }
    setQType(i: number, t: string) { this.questions.at(i).get('typeQuestion')?.setValue(t); }

    addQuestion() {
        this.questions.push(this.fb.group({
            id: [null],
            contenu: ['', Validators.required],
            typeQuestion: ['QCM', Validators.required],
            bonneReponse: ['', Validators.required],
            points: [10, [Validators.required, Validators.min(1)]]
        }));
    }

    removeQuestion(i: number) { this.questions.removeAt(i); }

    onSubmit() {
        if (this.testForm.valid && this.testId) {
            const formValue = {
                ...this.configGroup.value,
                questions: this.questions.value
            } as any;

            this.testService.updateTest(this.testId, formValue).subscribe({
                next: () => {
                    this.snackBar.open('Test mis à jour !', 'OK', { duration: 3000 });
                    this.router.navigate(['/tests']);
                },
                error: (err) => {
                    this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 5000 });
                    console.error(err);
                }
            });
        }
    }
}
