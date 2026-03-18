import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="shell">

      <!-- ── TOP NAV ── -->
      <nav class="topnav">
        <div class="nav-brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="var(--bg-dark)"/>
            <path d="M8 20 L14 8 L20 20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="14" cy="14" r="2" fill="var(--success)"/>
          </svg>
          <span class="nav-title">Concepteur d'Évaluation</span>
        </div>

        <div class="nav-steps">
          <div class="step-dot" [class.active]="activeStep === 0" [class.done]="activeStep > 0" (click)="activeStep > 0 && goToStep(0)">
            <span class="dot-num">1</span>
            <span class="dot-label">Configuration</span>
          </div>
          <div class="step-line" [class.done]="activeStep > 0"></div>
          <div class="step-dot" [class.active]="activeStep === 1">
            <span class="dot-num">2</span>
            <span class="dot-label">Questions</span>
          </div>
        </div>

        <button class="btn-cancel" routerLink="/tests">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Abandonner
        </button>
      </nav>

      <!-- ── PROGRESS BAR ── -->
      <div class="progress-rail">
        <div class="progress-bar" [style.width]="activeStep === 0 ? '50%' : '100%'"></div>
      </div>

      <!-- ── PAGE BODY ── -->
      <div class="page-body">
        <form [formGroup]="testForm">

          <!-- ══════ STEP 1: CONFIG ══════ -->
          <div class="step-panel" *ngIf="activeStep === 0" formGroupName="config">

            <div class="step-hero">
              <p class="step-eyebrow">Étape 1 sur 2</p>
              <h1 class="step-heading">Configurez votre évaluation</h1>
              <p class="step-sub">Définissez le titre, le niveau et les instructions avant d'ajouter les questions.</p>
            </div>

            <!-- Cover image upload -->
            <div class="cover-upload-zone" (click)="coverInput.click()" [class.has-image]="coverPreview">
              <input #coverInput type="file" accept="image/*" (change)="onCoverChange($event)" hidden>
              <img *ngIf="coverPreview" [src]="coverPreview" class="cover-img" alt="Couverture">
              <div class="upload-placeholder" *ngIf="!coverPreview">
                <div class="upload-icon-wrap">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 22V10M10 16l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="4" y="4" width="24" height="24" rx="6" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
                  </svg>
                </div>
                <p class="upload-hint">Ajouter une image de couverture</p>
                <span class="upload-sub">PNG, JPG · Recommandé 1200×400px</span>
              </div>
              <button *ngIf="coverPreview" class="cover-remove" type="button" (click)="$event.stopPropagation(); removeCover()">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="form-grid">

              <div class="field full">
                <label class="flabel">TITRE DE L'ÉVALUATION</label>
                <input class="finput lg" formControlName="titre"
                  placeholder="ex : Développeur Backend Java Senior"/>
              </div>

              <div class="field">
                <label class="flabel">TECHNOLOGIE</label>
                <input class="finput" formControlName="technologie" placeholder="ex : Spring Boot"/>
              </div>

              <div class="field">
                <label class="flabel">COMPÉTENCE CIBLE</label>
                <div class="select-wrap">
                  <select class="fselect" formControlName="competenceId">
                    <option value="" disabled selected>Sélectionner…</option>
                    <option *ngFor="let c of competencies()" [value]="c.id">{{c.nom}}</option>
                  </select>
                  <svg class="select-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>

              <div class="field full">
                <label class="flabel">NIVEAU DE DIFFICULTÉ</label>
                <div class="level-strip">
                  <button type="button" class="lvl" [class.active]="configGroup.get('niveau')?.value === 'DEBUTANT'" (click)="setLevel('DEBUTANT')">
                    <span class="lvl-bar b1"></span><span class="lvl-bar b2"></span><span class="lvl-bar b3"></span>
                    Junior
                  </button>
                  <button type="button" class="lvl" [class.active]="configGroup.get('niveau')?.value === 'INTERMEDIAIRE'" (click)="setLevel('INTERMEDIAIRE')">
                    <span class="lvl-bar b1 on"></span><span class="lvl-bar b2 on"></span><span class="lvl-bar b3"></span>
                    Confirmé
                  </button>
                  <button type="button" class="lvl" [class.active]="configGroup.get('niveau')?.value === 'AVANCE'" (click)="setLevel('AVANCE')">
                    <span class="lvl-bar b1 on"></span><span class="lvl-bar b2 on"></span><span class="lvl-bar b3 on"></span>
                    Senior
                  </button>
                  <button type="button" class="lvl expert" [class.active]="configGroup.get('niveau')?.value === 'EXPERT'" (click)="setLevel('EXPERT')">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1l1.5 4h4.2l-3.4 2.5 1.3 4L7 9 3.4 11.5l1.3-4L1.3 5H5.5z" fill="currentColor"/>
                    </svg>
                    Expert
                  </button>
                </div>
              </div>

              <div class="field narrow">
                <label class="flabel">DURÉE (min)</label>
                <input class="finput" type="number" formControlName="dureeMinutes"/>
              </div>

              <div class="field full">
                <label class="flabel">INSTRUCTIONS</label>
                <textarea class="ftextarea" formControlName="description" rows="5"
                  placeholder="Définissez les règles, le périmètre et les attentes pour les candidats…"></textarea>
              </div>

            </div>

            <div class="step-footer">
              <button type="button" class="btn-primary" [disabled]="configGroup.invalid" (click)="goToStep(1)">
                Suivant — Ajouter des Questions
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

          </div><!-- /step 1 -->


          <!-- ══════ STEP 2: QUESTIONS ══════ -->
          <div class="step-panel" *ngIf="activeStep === 1">

            <div class="step-hero">
              <p class="step-eyebrow">Étape 2 sur 2</p>
              <h1 class="step-heading">
                <span class="heading-count">{{questions.length}}</span>
                question{{questions.length !== 1 ? 's' : ''}}
              </h1>
              <p class="step-sub">Rédigez chaque question, sélectionnez son type et attribuez les points.</p>
            </div>

            <div class="qlist" formArrayName="questions">
              <div *ngFor="let qg of questions.controls; let i = index" [formGroupName]="i" class="qcard">

                <!-- Q header -->
                <div class="qcard-head">
                  <div class="qcard-num">Q{{(i+1).toString().padStart(2,'0')}}</div>
                  <div class="qtype-pills">
                    <button type="button" class="tpill" [class.on]="qg.get('typeQuestion')?.value==='QCM'"         (click)="setQType(i,'QCM')">QCM</button>
                    <button type="button" class="tpill" [class.on]="qg.get('typeQuestion')?.value==='VRAI_FAUX'"   (click)="setQType(i,'VRAI_FAUX')">Vrai / Faux</button>
                    <button type="button" class="tpill" [class.on]="qg.get('typeQuestion')?.value==='TEXTE_LIBRE'" (click)="setQType(i,'TEXTE_LIBRE')">Texte libre</button>
                  </div>
                  <button type="button" class="btn-del" (click)="removeQuestion(i)">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4h10M5 4V2.5h4V4M5.5 7v4M8.5 7v4M3 4l.8 7.5h6.4L11 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>

                <!-- Question image upload -->
                <label class="q-img-zone" [class.has-img]="questionImages[i]" [for]="'qimg-'+i">
                  <input type="file" accept="image/*" [id]="'qimg-'+i"
                    (change)="onQuestionImageChange($event, i)" hidden>
                  <img *ngIf="questionImages[i]" [src]="questionImages[i]!" class="q-img" alt="">
                  <div class="q-img-placeholder" *ngIf="!questionImages[i]">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="1" y="1" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2.5"/>
                      <path d="M9 12V6M6 9l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Ajouter une image (optionnel)</span>
                  </div>
                  <button *ngIf="questionImages[i]" type="button" class="q-img-remove"
                    (click)="$event.preventDefault(); $event.stopPropagation(); removeQuestionImage(i)">×</button>
                </label>

                <!-- Q fields -->
                <div class="qcard-body">
                  <div class="field full">
                    <label class="flabel">ÉNONCÉ</label>
                    <textarea class="ftextarea sm" formControlName="contenu" rows="2"
                      placeholder="Rédigez l'énoncé de la question…"></textarea>
                  </div>
                  <div class="qcard-bottom">
                    <div class="field" style="flex:1">
                      <label class="flabel">BONNE RÉPONSE / CLÉ</label>
                      <input class="finput" formControlName="bonneReponse"
                        placeholder="ex : A, Vrai, ou réponse attendue…"/>
                    </div>
                    <div class="field pts-field">
                      <label class="flabel">POINTS</label>
                      <div class="pts-wrap">
                        <input class="finput center" type="number" formControlName="points"/>
                        <span class="pts-unit">pts</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Empty state -->
            <div class="empty-state" *ngIf="questions.length === 0">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect x="6" y="6" width="44" height="44" rx="10" stroke="currentColor" stroke-width="1.8" stroke-dasharray="6 4" opacity="0.3"/>
                <path d="M28 18v16M28 38v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
              </svg>
              <h3>Aucune question</h3>
              <p>Votre évaluation nécessite au moins une question.</p>
              <button type="button" class="btn-primary" (click)="addQuestion()">Créer la première question</button>
            </div>

            <button type="button" class="btn-add-q" (click)="addQuestion()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
              Ajouter une question
            </button>

            <!-- Score summary -->
            <div class="score-bar" *ngIf="questions.length > 0">
              <div class="score-item">
                <span class="score-label">Total des points</span>
                <span class="score-val">{{calculateTotalPoints()}} pts</span>
              </div>
              <div class="score-item">
                <span class="score-label">Questions</span>
                <span class="score-val">{{questions.length}}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Durée</span>
                <span class="score-val">{{testForm.get('config.dureeMinutes')?.value}} min</span>
              </div>
            </div>

            <div class="step-footer">
              <button type="button" class="btn-ghost" (click)="goToStep(0)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Paramètres
              </button>
              <button type="button" class="btn-submit"
                (click)="onSubmit()" [disabled]="testForm.invalid || questions.length === 0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8l4 4 8-8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Finaliser l'évaluation
              </button>
            </div>

          </div><!-- /step 2 -->

        </form>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Sora:wght@300;400;600;700&display=swap');

    :host {
      --ink: var(--text-primary);
      --ink-60: var(--text-secondary);
      --ink-30: var(--text-light);
      --ink-10: rgba(13,13,20,0.1);
      --ink-05: rgba(13,13,20,0.05);
      --paper: var(--bg-light);
      --white: #ffffff;
      --border: var(--border-light);
      --green: var(--success);
      --blue: var(--info);
      --rose: var(--error);
      --r: 12px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .shell {
      min-height: 100vh;
      background: var(--paper);
      font-family: 'Sora', sans-serif;
      color: var(--ink);
    }

    /* ── TOPNAV ── */
    .topnav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2.5rem; height: 60px;
      background: rgba(245,243,239,0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-brand { display: flex; align-items: center; gap: 0.75rem; }
    .nav-title { font-size: 0.85rem; font-weight: 700; letter-spacing: -0.02em; }

    .nav-steps { display: flex; align-items: center; gap: 0.75rem; }
    .step-dot {
      display: flex; align-items: center; gap: 0.5rem;
      font-family: 'DM Mono', monospace; font-size: 0.7rem;
      color: var(--ink-30); cursor: default; transition: color 0.2s;
    }
    .step-dot.active { color: var(--ink); }
    .step-dot.done { color: var(--green); cursor: pointer; }
    .dot-num {
      width: 22px; height: 22px; border-radius: 50%;
      border: 1.5px solid currentColor;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 700; transition: all 0.2s;
    }
    .step-dot.active .dot-num { background: var(--ink); color: white; border-color: var(--ink); }
    .step-dot.done .dot-num { background: var(--green); color: white; border-color: var(--green); }
    .step-line { width: 40px; height: 1.5px; background: var(--border); transition: background 0.4s; }
    .step-line.done { background: var(--green); }

    .btn-cancel {
      display: flex; align-items: center; gap: 0.4rem;
      background: none; border: 1px solid var(--border);
      color: var(--ink-60); font-family: 'Sora', sans-serif;
      font-size: 0.78rem; font-weight: 600;
      padding: 0.45rem 1rem; border-radius: 99px; cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { border-color: var(--rose); color: var(--rose); }

    .progress-rail { height: 2px; background: var(--border); }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--green), var(--blue));
      transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* ── PAGE BODY ── */
    .page-body { max-width: 760px; margin: 0 auto; padding: 3rem 2rem 6rem; }

    .step-panel { animation: fadeUp 0.35s ease forwards; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .step-hero { margin-bottom: 2.5rem; }
    .step-eyebrow {
      font-family: 'DM Mono', monospace; font-size: 0.6rem;
      letter-spacing: 0.15em; color: var(--ink-30);
      text-transform: uppercase; margin-bottom: 0.5rem;
    }
    .step-heading {
      font-family: 'DM Serif Display', serif;
      font-size: 2.5rem; font-weight: 400;
      line-height: 1.15; margin-bottom: 0.5rem;
    }
    .heading-count {
      font-style: italic; color: transparent;
      -webkit-text-stroke: 2px var(--ink);
    }
    .step-sub { font-size: 0.9rem; color: var(--ink-60); line-height: 1.6; }

    /* Cover upload */
    .cover-upload-zone {
      position: relative; width: 100%; height: 180px;
      border: 1.5px dashed var(--border); border-radius: 16px;
      overflow: hidden; cursor: pointer; margin-bottom: 2.5rem;
      background: var(--white);
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.2s, background 0.2s;
    }
    .cover-upload-zone:hover { border-color: var(--ink-30); background: var(--ink-05); }
    .cover-upload-zone.has-image { border-style: solid; }
    .cover-img { width: 100%; height: 100%; object-fit: cover; }
    .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--ink-30); }
    .upload-icon-wrap { opacity: 0.5; }
    .upload-hint { font-size: 0.85rem; font-weight: 600; color: var(--ink-60); }
    .upload-sub { font-family: 'DM Mono', monospace; font-size: 0.65rem; }
    .cover-remove {
      position: absolute; top: 10px; right: 10px;
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(0,0,0,0.5); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; color: white;
    }

    /* Form grid */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; margin-bottom: 2rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field.full { grid-column: 1 / -1; }
    .field.narrow { width: 140px; }

    .flabel {
      font-family: 'DM Mono', monospace; font-size: 0.58rem;
      letter-spacing: 0.14em; color: var(--ink-30); font-weight: 500;
    }

    .finput {
      width: 100%; padding: 0.75rem 1rem;
      background: var(--white); border: 1.5px solid var(--border); border-radius: var(--r);
      font-family: 'Sora', sans-serif; font-size: 0.9rem; color: var(--ink);
      outline: none; transition: all 0.2s; appearance: none;
    }
    .finput.lg { font-size: 1.05rem; font-weight: 600; }
    .finput.center { text-align: center; }
    .finput:focus { border-color: var(--ink); box-shadow: 0 0 0 3px var(--ink-10); }
    .finput::placeholder { color: var(--ink-30); }

    .select-wrap { position: relative; }
    .fselect {
      width: 100%; padding: 0.75rem 2.5rem 0.75rem 1rem;
      background: var(--white); border: 1.5px solid var(--border); border-radius: var(--r);
      font-family: 'Sora', sans-serif; font-size: 0.9rem; color: var(--ink);
      outline: none; appearance: none; cursor: pointer; transition: all 0.2s;
    }
    .fselect:focus { border-color: var(--ink); box-shadow: 0 0 0 3px var(--ink-10); }
    .select-chevron { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--ink-30); }

    .ftextarea {
      width: 100%; padding: 0.85rem 1rem;
      background: var(--white); border: 1.5px solid var(--border); border-radius: var(--r);
      font-family: 'Sora', sans-serif; font-size: 0.9rem; color: var(--ink);
      resize: vertical; outline: none; line-height: 1.6; transition: all 0.2s;
    }
    .ftextarea.sm { font-size: 0.88rem; }
    .ftextarea:focus { border-color: var(--ink); box-shadow: 0 0 0 3px var(--ink-10); }
    .ftextarea::placeholder { color: var(--ink-30); }

    /* Level strip */
    .level-strip { display: flex; gap: 0.5rem; }
    .lvl {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
      padding: 0.7rem 0.5rem;
      background: var(--white); border: 1.5px solid var(--border); border-radius: var(--r);
      font-family: 'Sora', sans-serif; font-size: 0.78rem; font-weight: 600;
      color: var(--ink-60); cursor: pointer; transition: all 0.2s;
    }
    .lvl:hover { border-color: var(--ink-30); }
    .lvl.active { background: var(--ink); border-color: var(--ink); color: white; }
    .lvl.expert.active { background: var(--accent); border-color: var(--accent); }
    .lvl-bar { display: inline-block; width: 4px; border-radius: 2px; background: currentColor; opacity: 0.2; }
    .lvl-bar.b1 { height: 6px; } .lvl-bar.b2 { height: 10px; } .lvl-bar.b3 { height: 14px; }
    .lvl-bar.on { opacity: 1; }
    .lvl.active .lvl-bar { opacity: 0.5; } .lvl.active .lvl-bar.on { opacity: 1; }

    /* Questions */
    .qlist { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 1.5rem; }

    .qcard {
      background: var(--white); border: 1.5px solid var(--border); border-radius: 18px;
      overflow: hidden; transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .qcard:hover {
      box-shadow: 0 10px 28px rgba(13,13,20,0.07);
      border-color: rgba(13,13,20,0.18); transform: translateY(-2px);
    }

    .qcard-head {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.75rem 1.25rem;
      background: var(--ink-05); border-bottom: 1.5px solid var(--border);
    }
    .qcard-num { font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 500; color: var(--ink-30); flex-shrink: 0; }

    .qtype-pills { display: flex; gap: 0.35rem; flex: 1; flex-wrap: wrap; }
    .tpill {
      padding: 0.28rem 0.75rem; border-radius: 99px;
      border: 1.5px solid var(--border); background: transparent;
      font-family: 'Sora', sans-serif; font-size: 0.68rem; font-weight: 600;
      color: var(--ink-60); cursor: pointer; transition: all 0.15s;
    }
    .tpill.on { background: var(--ink); border-color: var(--ink); color: white; }
    .tpill:hover:not(.on) { border-color: var(--ink-30); }

    .btn-del {
      background: none; border: none; cursor: pointer; color: var(--ink-30);
      padding: 0.3rem; border-radius: 8px; display: flex; align-items: center; transition: all 0.15s;
    }
    .btn-del:hover { color: var(--rose); background: rgba(248,113,113,0.08); }

    /* Question image upload */
    .q-img-zone {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 120px;
      border-bottom: 1.5px dashed var(--border);
      cursor: pointer; overflow: hidden; position: relative;
      background: var(--ink-05); transition: background 0.2s;
    }
    .q-img-zone:hover { background: var(--ink-10); }
    .q-img-zone.has-img { border-bottom-style: solid; }
    .q-img { width: 100%; height: 100%; object-fit: cover; }
    .q-img-placeholder {
      display: flex; align-items: center; gap: 0.5rem;
      color: var(--ink-30); font-size: 0.75rem; pointer-events: none;
    }
    .q-img-remove {
      position: absolute; top: 8px; right: 8px;
      width: 24px; height: 24px; border-radius: 50%;
      background: rgba(0,0,0,0.45); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 1rem; line-height: 1;
    }

    .qcard-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .qcard-bottom { display: flex; gap: 1rem; align-items: flex-start; }
    .pts-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .pts-field { width: 120px; flex-shrink: 0; }
    .pts-unit { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--ink-30); }

    /* Empty state */
    .empty-state {
      text-align: center; padding: 3.5rem 2rem;
      border: 2px dashed var(--border); border-radius: 16px;
      color: var(--ink-60); margin-bottom: 1.5rem;
    }
    .empty-state svg { margin: 0 auto 1rem; display: block; color: var(--ink-30); }
    .empty-state h3 { font-family: 'DM Serif Display', serif; font-size: 1.4rem; font-weight: 400; margin-bottom: 0.4rem; color: var(--ink); }
    .empty-state p { font-size: 0.85rem; margin-bottom: 1.5rem; }

    /* Score bar */
    .score-bar {
      display: flex; margin-bottom: 1.5rem;
      background: var(--white); border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden;
    }
    .score-item {
      flex: 1; padding: 1rem 1.25rem;
      display: flex; flex-direction: column; gap: 0.2rem;
      border-right: 1px solid var(--border);
    }
    .score-item:last-child { border-right: none; }
    .score-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; color: var(--ink-30); }
    .score-val { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--ink); }

    .btn-add-q {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.6rem;
      padding: 0.85rem; background: transparent;
      border: 1.5px dashed var(--border); border-radius: var(--r);
      font-family: 'Sora', sans-serif; font-size: 0.85rem; font-weight: 600;
      color: var(--ink-60); cursor: pointer; margin-bottom: 2rem; transition: all 0.2s;
    }
    .btn-add-q:hover { border-color: var(--ink); color: var(--ink); background: var(--ink-05); }

    /* Footer actions */
    .step-footer {
      display: flex; align-items: center; gap: 1rem;
      padding-top: 1.5rem; border-top: 1.5px solid var(--border);
    }
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--ink); color: white; border: none;
      font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 700;
      padding: 0.85rem 2rem; border-radius: 99px; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(13,13,20,0.18); }
    .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
    .btn-ghost {
      display: flex; align-items: center; gap: 0.45rem;
      background: none; border: 1.5px solid var(--border); color: var(--ink-60);
      font-family: 'Sora', sans-serif; font-size: 0.85rem; font-weight: 600;
      padding: 0.8rem 1.5rem; border-radius: 99px; cursor: pointer; transition: all 0.2s;
    }
    .btn-ghost:hover { border-color: var(--ink); color: var(--ink); }
    .btn-submit {
      display: flex; align-items: center; gap: 0.5rem; margin-left: auto;
      background: linear-gradient(135deg, var(--success), var(--accent)); color: white; border: none;
      font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 700;
      padding: 0.85rem 2rem; border-radius: 99px; cursor: pointer; transition: all 0.2s;
    }
    .btn-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(5,150,105,0.3); }
    .btn-submit:disabled { opacity: 0.35; cursor: not-allowed; }

    @media (max-width: 680px) {
      .form-grid { grid-template-columns: 1fr; }
      .field.full { grid-column: 1; }
      .field.narrow { width: 100%; }
      .level-strip { flex-wrap: wrap; }
      .qtype-pills { flex-wrap: wrap; }
      .topnav { padding: 0 1.25rem; }
      .page-body { padding: 2rem 1.25rem 5rem; }
      .nav-steps { display: none; }
    }
  `]
})
export class CreateTestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private testService = inject(TestService);
  private rhService = inject(RhService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  competencies = signal<CompetenceDTO[]>([]);
  activeStep = 0;
  coverPreview: string | null = null;
  questionImages: (string | null)[] = [];

  testForm = this.fb.group({
    config: this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      competenceId: ['', Validators.required],
      technologie: [''],
      dureeMinutes: [30, [Validators.required, Validators.min(1)]],
      niveau: ['DEBUTANT', Validators.required]
    }),
    questions: this.fb.array<FormGroup>([])
  });

  get configGroup() { return this.testForm.get('config') as FormGroup; }
  get questions() { return this.testForm.controls.questions; }

  ngOnInit() {
    this.loadCompetencies();
    this.addQuestion();
  }

  loadCompetencies() {
    this.rhService.getCompetencies().subscribe((data: any[]) => this.competencies.set(data));
  }

  goToStep(n: number) {
    this.activeStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setLevel(val: string) { this.configGroup.get('niveau')?.setValue(val); }
  setQType(i: number, t: string) { this.questions.at(i).get('typeQuestion')?.setValue(t); }

  addQuestion() {
    this.questions.push(this.fb.group({
      contenu: ['', Validators.required],
      typeQuestion: ['QCM', Validators.required],
      bonneReponse: ['', Validators.required],
      points: [10, [Validators.required, Validators.min(1)]]
    }));
    this.questionImages.push(null);
  }

  removeQuestion(i: number) {
    this.questions.removeAt(i);
    this.questionImages.splice(i, 1);
  }

  calculateTotalPoints(): number {
    return this.questions.controls.reduce((acc, q) => {
      const pts = q.get('points')?.value;
      return acc + (typeof pts === 'number' ? pts : 0);
    }, 0);
  }

  onCoverChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.coverPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }
  removeCover() { this.coverPreview = null; }

  onQuestionImageChange(e: Event, i: number) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.questionImages[i] = reader.result as string;
      reader.readAsDataURL(file);
    }
  }
  removeQuestionImage(i: number) { this.questionImages[i] = null; }

  onSubmit() {
    if (this.testForm.valid) {
      const formValue = {
        ...this.configGroup.value,
        questions: this.questions.value
      } as TestTechnique;

      this.testService.createTest(formValue).subscribe({
        next: () => {
          this.snackBar.open('Évaluation conçue avec succès !', 'Génial', { duration: 3000 });
          this.router.navigate(['/tests']);
        },
        error: (err) => {
          const msg = err.error?.message || 'Une erreur technique est survenue.';
          this.snackBar.open(msg, 'Fermer', { duration: 7000, panelClass: ['error-snackbar'] });
          console.error('Create Test Error:', err);
        }
      });
    }
  }
}