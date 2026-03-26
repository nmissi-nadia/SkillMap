
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, EmployeeCompetence } from '../../../core/models/employee.model';
import { MetadataService } from '../../../core/services/metadata.service';

@Component({
    selector: 'app-team-member-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="detail-container p-6">
        <div class="mb-6 flex items-center justify-between">
            <button routerLink="/manager/team" class="flex items-center text-gray-400 hover:text-white transition-colors">
                <span class="mr-2">←</span> Retour à l'équipe
            </button>
            <h1 class="text-2xl font-bold text-white">Profil Membre</h1>
        </div>

        @if (loading()) {
            <div class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        } @else if (error()) {
            <div class="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">
                {{ error() }}
            </div>
        } @else if (employee()) {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Column: Basic Info -->
                <div class="lg:col-span-1 space-y-6">
                    <div class="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl text-center">
                        <div class="w-24 h-24 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border border-blue-500/30">
                            {{ employee()!.prenom[0] }}{{ employee()!.nom[0] }}
                        </div>
                        <h2 class="text-xl font-bold text-white">{{ employee()!.prenom }} {{ employee()!.nom }}</h2>
                        <p class="text-gray-400 mb-4">{{ employee()!.poste || 'Poste non défini' }}</p>
                        <div class="flex flex-wrap justify-center gap-2">
                            <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-blue-400">
                                {{ employee()!.role }}
                            </span>
                            <span class="px-3 py-1 rounded-full text-xs" 
                                  [ngClass]="employee()!.disponibilite ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'">
                                {{ employee()!.disponibilite ? 'Disponible' : 'Occupé' }}
                            </span>
                        </div>
                    </div>

                    <div class="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
                        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Détails</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-gray-500">Email</label>
                                <p class="text-white">{{ employee()!.email }}</p>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500">Département</label>
                                <p class="text-white">{{ employee()!.departement || 'Non assigné' }}</p>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500">Expérience</label>
                                <p class="text-white">{{ employee()!.niveauExperience || 'Non spécifié' }}</p>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500">Matricule</label>
                                <p class="text-white">{{ employee()!.matricule || 'N/A' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Skills & History -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
                        <h3 class="text-lg font-bold text-white mb-6">Compétences & Évaluations</h3>
                        
                        @if (competencies().length > 0) {
                            <div class="space-y-6">
                                @for (comp of competencies(); track comp.id) {
                                    <div class="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div class="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 class="font-bold text-white text-lg">{{ comp.competence.nom }}</h4>
                                                <span class="text-xs text-gray-500">{{ comp.competence.type }}</span>
                                            </div>
                                            <div class="flex gap-4">
                                                <div class="text-center">
                                                    <span class="block text-[10px] text-gray-500 uppercase">Auto</span>
                                                    <span class="text-sm font-bold text-blue-400">{{ comp.niveauAuto }}/5</span>
                                                </div>
                                                <div class="text-center">
                                                    <span class="block text-[10px] text-gray-500 uppercase">Manager</span>
                                                    <span class="text-sm font-bold" [ngClass]="(comp.niveauManager || 0) > 0 ? 'text-green-400' : 'text-gray-600'">
                                                        {{ (comp.niveauManager || 0) > 0 ? comp.niveauManager + '/5' : '-' }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Progress bar comparison -->
                                        <div class="relative h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                                            <div class="absolute h-full bg-blue-500/50" [style.width.%]="comp.niveauAuto * 20"></div>
                                            <div class="absolute h-full bg-green-500" [style.width.%]="(comp.niveauManager || 0) * 20"></div>
                                        </div>

                                        @if (comp.commentaire) {
                                            <p class="text-sm text-gray-400 italic">"{{ comp.commentaire }}"</p>
                                        }
                                        <div class="mt-2 text-[10px] text-gray-600">
                                            Dernière évaluation: {{ comp.dateEvaluation | date:'dd/MM/yyyy' }}
                                        </div>
                                    </div>
                                }
                            </div>
                        } @else {
                            <div class="text-center py-10 text-gray-500">
                                Aucune compétence évaluée pour le moment.
                            </div>
                        }
                    </div>
                </div>
            </div>
        }
    </div>
    `,
    styles: [`
        :host { display: block; }
        .detail-container { min-height: 100vh; }
    `]
})
export class TeamMemberDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private employeeService = inject(EmployeeService);
    
    employee = signal<Employee | null>(null);
    competencies = signal<EmployeeCompetence[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadData(id);
        } else {
            this.error.set("ID membre manquant");
            this.loading.set(false);
        }
    }

    loadData(id: string) {
        this.loading.set(true);
        this.employeeService.getEmployeeById(id).subscribe({
            next: (emp) => {
                this.employee.set(emp);
                this.loadHistory(id);
            },
            error: (err) => {
                this.error.set("Impossible de charger le profil");
                this.loading.set(false);
            }
        });
    }

    loadHistory(id: string) {
        this.employeeService.getEvaluationHistory(id).subscribe({
            next: (history) => {
                this.competencies.set(history);
                this.loading.set(false);
            },
            error: (err) => {
                console.error("Erreur historique:", err);
                this.loading.set(false); // On continue même si l'historique échoue
            }
        });
    }
}
