import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TestService } from '../services/test.service';
import { TestTechnique } from '../models/test.model';
import { environment } from '../../../../environments/environment';

interface EmployeSimpleDTO {
  id: string;
  nom: string;
  prenom: string;
  poste?: string;
  email?: string;
}

@Component({
  selector: 'app-assign-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen p-4 md:p-8 bg-background text-text-primary animate-fade-in">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-10 flex items-center gap-6">
          <button (click)="goBack()" 
                  class="h-12 w-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all shadow-sm">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Assigner un Test
            </h1>
            <p class="text-text-secondary font-medium">Planification de l'évaluation technique</p>
          </div>
        </div>

        @if (test(); as testData) {
          <div class="space-y-8 animate-slide-down">
            <!-- Test Details Card -->
            <div class="bg-surface rounded-3xl p-6 md:p-8 shadow-xl border border-border relative overflow-hidden group">
              <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg class="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              
              <div class="relative z-10">
                <div class="flex flex-wrap gap-3 mb-6">
                  <span class="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                    {{ testData.technologie || 'Technique' }}
                  </span>
                  <span class="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
                    {{ testData.niveau }}
                  </span>
                  <span class="px-3 py-1 bg-info/10 text-info text-xs font-bold rounded-full uppercase tracking-wider">
                    {{ testData.dureeMinutes }} MIN
                  </span>
                </div>

                <h2 class="text-2xl font-bold mb-4">{{ testData.titre }}</h2>
                <p class="text-text-secondary leading-relaxed mb-0">{{ testData.description }}</p>
              </div>
            </div>

            <!-- Selection Card -->
            <div class="bg-surface rounded-3xl p-6 md:p-8 shadow-lg border border-border">
              <div class="flex items-center gap-3 mb-8">
                <div class="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold">Sélection de l'employé</h3>
              </div>

              <div class="space-y-4">
                @if (loading) {
                  <div class="flex justify-center py-10">
                    <div class="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                } @else if (employees().length > 0) {
                  <div class="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    @for (emp of employees(); track emp.id) {
                      <button (click)="selectedEmployeId = emp.id"
                              [class]="selectedEmployeId === emp.id 
                                ? 'w-full text-left p-4 rounded-2xl border border-accent bg-accent text-white transition-all flex items-center justify-between group' 
                                : 'w-full text-left p-4 rounded-2xl border border-border bg-surface-hover hover:border-accent transition-all flex items-center justify-between group'"
                      >
                        <div class="flex items-center gap-4">
                          <div class="h-12 w-12 rounded-full bg-background flex items-center justify-center text-accent font-bold text-lg"
                               [class.bg-white]="selectedEmployeId === emp.id"
                               [class.text-accent]="selectedEmployeId === emp.id">
                            {{ emp.prenom[0] }}{{ emp.nom[0] }}
                          </div>
                          <div>
                            <div class="font-bold">{{ emp.prenom }} {{ emp.nom }}</div>
                            <div class="text-sm opacity-80" [class.text-text-secondary]="selectedEmployeId !== emp.id">
                              {{ emp.poste || 'Employé' }}
                            </div>
                          </div>
                        </div>
                        @if (selectedEmployeId === emp.id) {
                          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        }
                      </button>
                    }
                  </div>
                } @else {
                  <div class="p-8 text-center bg-background rounded-2xl border border-dashed border-border text-text-secondary">
                    <p>Aucun employé disponible pour ce test.</p>
                  </div>
                }
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 pt-4">
              <button (click)="goBack()" 
                      class="flex-1 px-8 py-4 rounded-2xl border border-border font-bold text-text-secondary hover:bg-surface transition-all">
                Annuler
              </button>
              <button (click)="onAssign()" 
                      [disabled]="!selectedEmployeId"
                      class="flex-[2] px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none">
                Confirmer l'Assignation
              </button>
            </div>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center py-32 animate-fade-in text-text-secondary">
            <div class="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p class="font-medium">Chargement des détails du test...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #d1d5db;
    }
  `]
})
export class AssignTestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testService = inject(TestService);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  test = signal<TestTechnique | null>(null);
  employees = signal<EmployeSimpleDTO[]>([]);
  selectedEmployeId: string | null = null;
  loading = true;

  ngOnInit(): void {
    const testId = this.route.snapshot.paramMap.get('id');
    if (testId) {
      this.testService.getTestById(testId).subscribe(data => this.test.set(data));
    }
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.http.get<EmployeSimpleDTO[]>(`${environment.apiUrl}/employes`).subscribe({
      next: (res) => {
        this.employees.set(res);
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Erreur chargement employés:', err);
        this.loading = false;
        this.snackBar.open('Impossible de charger la liste des employés.', 'Fermer', { duration: 4000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tests']);
  }

  onAssign(): void {
    const testId = this.test()?.id;
    if (testId && this.selectedEmployeId) {
      this.testService.assignTest(testId, this.selectedEmployeId).subscribe({
        next: () => {
          this.snackBar.open('Test assigné avec succès !', 'Fermer', { duration: 3000 });
          this.router.navigate(['/tests']);
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Erreur lors de l\'assignation.';
          this.snackBar.open(msg, 'Fermer', { duration: 4000 });
        }
      });
    }
  }
}
