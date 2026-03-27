import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';
import { Employee, EmployeeCompetence } from '../../../core/models/employee.model';

@Component({
    selector: 'app-team-member-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, DatePipe],
    template: `
    <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-4 lg:p-8 animate-fade-in pb-20">
        <!-- Header & Breadcrumbs -->
        <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
                <button routerLink="/manager/team" class="flex items-center text-text-secondary dark:text-gray-400 hover:text-primary transition-colors group mb-2">
                    <svg class="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour à l'équipe
                </button>
                <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Profil Collaborateur
                </h1>
            </div>

            @if (employee()) {
                <div class="flex gap-4">
                    <button (click)="showEvaluateModal.set(true)" 
                        class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Évaluer
                    </button>
                    <button (click)="showTestModal.set(true)"
                        class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Assigner Test
                    </button>
                </div>
            }
        </div>

        @if (loading()) {
            <div class="flex flex-col items-center justify-center py-20">
                <div class="relative w-16 h-16 mb-4">
                    <div class="absolute inset-0 border-4 border-blue-100 dark:border-blue-900 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p class="text-gray-500 font-medium italic">Chargement du profil dynamique...</p>
            </div>
        } @else if (error()) {
            <div class="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-3xl backdrop-blur-xl flex flex-col items-center">
                <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-lg font-bold">{{ error() }}</p>
                <button (click)="loadData(route.snapshot.paramMap.get('id')!)" class="mt-4 text-sm font-bold underline">Réessayer</button>
            </div>
        } @else if (employee()) {
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <!-- Sidebar Info -->
                <div class="lg:col-span-1 space-y-8 animate-slide-right">
                    <!-- Basic Card -->
                    <div class="bg-white/80 dark:bg-gray-800/50 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 p-8 rounded-[32px] shadow-xl text-center">
                        <div class="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center text-4xl font-bold text-white mx-auto mb-6 shadow-2xl shadow-blue-500/30 rotate-3 group hover:rotate-0 transition-transform duration-500">
                            {{ employee()!.prenom[0] }}{{ employee()!.nom[0] }}
                        </div>
                        <h2 class="text-2xl font-black text-gray-900 dark:text-white">{{ employee()!.prenom }} {{ employee()!.nom }}</h2>
                        <p class="text-blue-500 font-bold mb-6 italic">{{ employee()!.poste || 'Poste non défini' }}</p>
                        
                        <div class="flex flex-col gap-3">
                            <div class="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <span class="text-xs font-black text-gray-400">STATUS</span>
                                <span class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                    [ngClass]="employee()!.disponibilite ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'">
                                    {{ employee()!.disponibilite ? 'Disponible' : 'En Mission' }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <span class="text-xs font-black text-gray-400">NIVEAU</span>
                                <span class="text-gray-900 dark:text-white font-black">{{ employee()!.niveauExperience || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Card -->
                    <div class="bg-white/80 dark:bg-gray-800/50 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 p-8 rounded-[32px] shadow-xl">
                        <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Informations Clés</h3>
                        <div class="space-y-6">
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <label class="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Email</label>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{{ employee()!.email }}</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <label class="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Département</label>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ employee()!.departement || 'Non assigné' }}</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <label class="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Matricule</label>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white uppercase">{{ employee()!.matricule || 'N/A' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="lg:col-span-3 space-y-8 animate-slide-up">
                    <!-- Skills Section -->
                    <div class="bg-white/80 dark:bg-gray-800/50 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 p-8 rounded-[32px] shadow-xl">
                        <div class="flex items-center justify-between mb-10">
                            <div>
                                <h3 class="text-2xl font-black text-gray-900 dark:text-white">Cartographie des Compétences</h3>
                                <p class="text-sm text-gray-500 mt-1">Comparaison entre auto-évaluations et validations managériales.</p>
                            </div>
                            <div class="hidden sm:flex items-center gap-6 bg-gray-50 dark:bg-gray-900/50 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>
                                    <span class="text-[10px] font-black text-gray-400 uppercase">Auto</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></span>
                                    <span class="text-[10px] font-black text-gray-400 uppercase">Manager</span>
                                </div>
                            </div>
                        </div>
                        
                        @if (competencies().length > 0) {
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                @for (comp of competencies(); track comp.id) {
                                    <div class="p-8 bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 rounded-[24px] hover:border-blue-500/50 transition-all duration-500 group shadow-sm hover:shadow-xl">
                                        <div class="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 class="font-black text-gray-900 dark:text-white text-xl group-hover:text-blue-600 transition-colors mb-1">{{ comp.competence.nom }}</h4>
                                                <span class="text-[10px] px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full font-black uppercase tracking-[0.1em] border border-blue-500/10">{{ comp.competence.type }}</span>
                                            </div>
                                            <div class="flex gap-4">
                                                <div class="text-center group-hover:scale-110 transition-transform">
                                                    <span class="block text-[9px] text-gray-400 font-black uppercase mb-1">AUTO</span>
                                                    <span class="text-sm font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl ring-1 ring-blue-500/20">{{ comp.niveauAuto }}/5</span>
                                                </div>
                                                <div class="text-center group-hover:scale-110 transition-transform">
                                                    <span class="block text-[9px] text-gray-400 font-black uppercase mb-1">MGR</span>
                                                    <span [class]="'text-sm font-black px-3 py-1.5 rounded-xl ring-1 ' + ((comp.niveauManager || 0) > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-500/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-800 ring-gray-200 dark:ring-gray-700')">
                                                        {{ (comp.niveauManager || 0) > 0 ? comp.niveauManager + '/5' : '-' }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Sophisticated Gauge -->
                                        <div class="relative h-5 bg-gray-100 dark:bg-gray-800/80 rounded-full overflow-hidden mb-6 shadow-inner border border-gray-200 dark:border-gray-700/50">
                                            <div class="absolute h-full bg-blue-500/20 transition-all duration-1000 ease-out" [style.width.%]="comp.niveauAuto * 20"></div>
                                            <div class="absolute h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-in-out border-r-2 border-white/30 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                                                [style.width.%]="(comp.niveauManager || 0) * 20">
                                            </div>
                                        </div>

                                        @if (comp.commentaire) {
                                            <div class="mt-6 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10 relative overflow-hidden">
                                                <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                                <p class="text-sm text-gray-700 dark:text-gray-300 font-medium italic">"{{ comp.commentaire }}"</p>
                                            </div>
                                        }
                                        
                                        <div class="mt-6 flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                            <div class="flex items-center gap-2">
                                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-[10px] text-gray-400 font-bold uppercase">{{ comp.dateEvaluation | date:'shortDate' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        } @else {
                            <div class="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-sm">
                                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h4 class="text-xl font-bold text-gray-400 mb-2">Portfolio de compétences vide</h4>
                                <p class="text-gray-500 max-w-xs mx-auto mb-8">Ce collaborateur n'a aucune évaluation active. Prenez l'initiative en évaluant une compétence maintenant.</p>
                                <button (click)="showEvaluateModal.set(true)" class="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                                    Nouvelle Évaluation
                                </button>
                            </div>
                        }
                    </div>

                    <!-- Performance Insights Row -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="group bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[32px] text-white shadow-2xl transition-all hover:scale-[1.02] hover:-rotate-1">
                            <span class="block text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Niveau Global</span>
                            <div class="flex items-baseline gap-3">
                                <span class="text-6xl font-black">{{ getAverageLevel() }}</span>
                                <span class="text-xl font-bold opacity-60">/ 5</span>
                            </div>
                            <div class="mt-6 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                <div class="h-full bg-white transition-all duration-1000" [style.width.%]="(+getAverageLevel()) * 20"></div>
                            </div>
                        </div>
                        
                        <div class="bg-white/80 dark:bg-gray-800/50 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 p-10 rounded-[32px] shadow-xl relative overflow-hidden group">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Points Forts</span>
                            <span class="text-5xl font-black text-gray-900 dark:text-white">{{ getStrongCount() }}</span>
                            <p class="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">Compétences > 4/5</p>
                        </div>
                        
                        <div class="bg-white/80 dark:bg-gray-800/50 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 p-10 rounded-[32px] shadow-xl relative overflow-hidden group">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tests Prévus</span>
                            <span class="text-5xl font-black text-gray-900 dark:text-white">0</span>
                            <p class="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">Techniques & Soft Skills</p>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>

    <!-- Enhanced Modals -->
    @if (showEvaluateModal() || showTestModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-xl animate-fade-in"
             (click)="closeModals()">
            
            <!-- Modal Container with subtle border glow -->
            <div class="w-full max-w-xl rounded-[48px] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden animate-slide-up"
                 (click)="$event.stopPropagation()">
                
                <!-- Combined Header Style -->
                <div [class]="'px-10 py-10 transition-colors duration-500 ' + (showEvaluateModal() ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700')">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h2 class="text-3xl font-black text-white">{{ showEvaluateModal() ? 'Évaluer le Talent' : 'Assigner un Défi' }}</h2>
                            <p class="text-white/70 font-bold uppercase tracking-widest text-xs mt-1">PROFIL : {{ employee()?.prenom }} {{ employee()?.nom }}</p>
                        </div>
                        <button (click)="closeModals()" class="p-3 bg-white/10 hover:bg-white/20 text-white rounded-[20px] transition-all">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Modal Body -->
                <div class="bg-white dark:bg-gray-900 p-10">
                    @if (showEvaluateModal()) {
                        <div class="space-y-10">
                            <!-- Field: Competence -->
                            <div class="space-y-4">
                                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compétence à Certifier</label>
                                <div class="relative group">
                                    <select [(ngModel)]="selectedCompetenceId" 
                                        class="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-3xl px-8 py-5 focus:ring-0 focus:border-emerald-500/50 outline-none transition-all font-black appearance-none text-gray-900 dark:text-white">
                                        <option value="" disabled>Sélectionner dans le référentiel...</option>
                                        @for (comp of availableCompetences(); track comp.id) {
                                            <option [value]="comp.id">{{ comp.nom }}</option>
                                        }
                                    </select>
                                    <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <!-- Field: Level -->
                            <div class="space-y-6">
                                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Estimation du Niveau</label>
                                <div class="flex justify-between gap-4">
                                    @for (level of [1,2,3,4,5]; track level) {
                                        <button (click)="evaluationLevel.set(level)"
                                            [class]="'flex-1 h-20 rounded-[24px] font-black text-2xl transition-all border-4 ' + 
                                            (evaluationLevel() === level ? 'bg-emerald-500 text-white border-emerald-300 shadow-2xl shadow-emerald-500/40 -translate-y-2' : 'bg-gray-50 dark:bg-gray-800 text-gray-300 border-transparent hover:border-emerald-500/30 group-hover:scale-105')">
                                            {{ level }}
                                        </button>
                                    }
                                </div>
                                <div class="flex justify-between px-2">
                                    <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Base</span>
                                    <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Expert</span>
                                </div>
                            </div>

                            <!-- Field: Comment -->
                            <div class="space-y-4">
                                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Observations Managériales</label>
                                <textarea [(ngModel)]="evaluationComment" rows="4"
                                    class="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] px-8 py-6 outline-none focus:border-emerald-500/50 transition-all font-medium text-gray-900 dark:text-gray-200 resize-none"
                                    placeholder="Partagez vos retours sur les performances observées..."></textarea>
                            </div>
                        </div>
                    } @else {
                        <div class="space-y-10">
                            <!-- Info Alert -->
                            <div class="bg-blue-500/5 dark:bg-blue-500/10 p-8 rounded-[32px] border border-blue-500/10 flex gap-6 items-center">
                                <div class="p-4 bg-blue-500 text-white rounded-[20px] shadow-lg shadow-blue-500/30">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p class="text-sm font-bold text-blue-800 dark:text-blue-300 leading-relaxed font-bold ">
                                    Le collaborateur recevra une invitation directe par email et dans son centre de notifications pour initier ce test.
                                </p>
                            </div>

                            <!-- Field: Test -->
                            <div class="space-y-4">
                                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nature du Test Technique</label>
                                <div class="relative group">
                                    <select [(ngModel)]="selectedTestId" 
                                        class="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-3xl px-8 py-5 focus:ring-0 focus:border-blue-500/50 outline-none transition-all font-black appearance-none text-gray-900 dark:text-white font-bold ">
                                        <option value="" disabled>Explorer les évaluations disponibles...</option>
                                        @for (test of availableTests(); track test.id) {
                                            <option [value]="test.id">{{ test.titre }} ({{ test.technologie }})</option>
                                        }
                                    </select>
                                    <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <!-- Field: Deadline -->
                            <div class="space-y-4">
                                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Échéance de Certification</label>
                                <div class="relative">
                                    <input type="date" [(ngModel)]="testDueDate"
                                        class="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-3xl px-8 py-5 outline-none focus:border-blue-500/50 transition-all font-black text-gray-900 dark:text-white font-bold " />
                                    <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <!-- Combined Footer -->
                    <div class="mt-12 flex gap-6">
                        <button (click)="closeModals()" 
                            class="flex-1 px-8 py-5 rounded-[24px] font-black text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:text-gray-600 dark:hover:text-gray-200">
                            Annuler l'Action
                        </button>
                        <button (click)="showEvaluateModal() ? submitEvaluation() : submitTestAssignment()" 
                            [disabled]="submitting() || (showEvaluateModal() ? !selectedCompetenceId() : !selectedTestId())"
                            [class]="'flex-[1.5] px-10 py-5 rounded-[24px] font-black text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ' + 
                            (showEvaluateModal() ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30')">
                            {{ submitting() ? 'Traitement en cours...' : (showEvaluateModal() ? 'Confirmer l\\'Évaluation' : 'Assigner le Test') }}
                            @if (!submitting()) {
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    }
    `,
    styles: [`
        :host { display: block; overflow-x: hidden; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-right { animation: slideRight 0.8s cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        
        select::-ms-expand { display: none; }
    `]
})
export class TeamMemberDetailComponent implements OnInit {
    public route = inject(ActivatedRoute);
    public managerService = inject(ManagerService);
    
    // Core data
    employee = signal<Employee | null>(null);
    competencies = signal<EmployeeCompetence[]>([]);
    availableCompetences = signal<any[]>([]);
    availableTests = signal<any[]>([]);
    
    // Status
    loading = signal(true);
    submitting = signal(false);
    error = signal<string | null>(null);
    
    // Modal states
    showEvaluateModal = signal(false);
    showTestModal = signal(false);
    
    // Form data
    selectedCompetenceId = signal<string>('');
    evaluationLevel = signal<number>(3);
    evaluationComment = signal<string>('');
    selectedTestId = signal<string>('');
    testDueDate = signal<string>('');

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadData(id);
            this.loadOptions();
        } else {
            this.error.set("Identifiant du collaborateur manquant");
            this.loading.set(false);
        }
    }

    loadData(id: string) {
        this.loading.set(true);
        this.managerService.getTeamMemberDetails(id).subscribe({
            next: (emp) => {
                this.employee.set(emp);
                this.loadHistory(id);
            },
            error: (err) => {
                console.error("Error loading employee:", err);
                this.error.set("Impossible de localiser ce profil dans votre équipe.");
                this.loading.set(false);
            }
        });
    }

    loadHistory(id: string) {
        this.managerService.getEvaluationHistory(id).subscribe({
            next: (history) => {
                this.competencies.set(history);
                this.loading.set(false);
            },
            error: (err) => {
                console.error("Error loading history:", err);
                this.loading.set(false);
            }
        });
    }

    loadOptions() {
        this.managerService.getAllAvailableCompetencies().subscribe(comps => this.availableCompetences.set(comps));
        this.managerService.getAllAvailableTests().subscribe(tests => this.availableTests.set(tests));
    }

    getAverageLevel(): string {
        const comps = this.competencies();
        if (comps.length === 0) return '0.0';
        const sum = comps.reduce((acc, c) => acc + (c.niveauManager || c.niveauAuto || 0), 0);
        return (sum / comps.length).toFixed(1);
    }

    getStrongCount(): number {
        return this.competencies().filter(c => (c.niveauManager || 0) >= 4).length;
    }

    closeModals() {
        if (this.submitting()) return;
        this.showEvaluateModal.set(false);
        this.showTestModal.set(false);
        this.resetForms();
    }

    resetForms() {
        this.selectedCompetenceId.set('');
        this.evaluationLevel.set(3);
        this.evaluationComment.set('');
        this.selectedTestId.set('');
        this.testDueDate.set('');
    }

    submitEvaluation() {
        const emp = this.employee();
        if (!emp || !this.selectedCompetenceId()) return;

        this.submitting.set(true);
        const req = {
            competenceId: this.selectedCompetenceId(),
            niveau: this.evaluationLevel(),
            commentaire: this.evaluationComment()
        };

        this.managerService.evaluateEmployee(emp.id, req).subscribe({
            next: () => {
                this.submitting.set(false);
                this.showEvaluateModal.set(false);
                this.loadHistory(emp.id); // Dynamic refresh
                this.resetForms();
            },
            error: (err) => {
                console.error("Evaluation error:", err);
                this.submitting.set(false);
                alert("Incident lors de la certification. Veuillez vérifier votre connexion.");
            }
        });
    }

    submitTestAssignment() {
        const emp = this.employee();
        if (!emp || !this.selectedTestId()) return;

        this.submitting.set(true);
        const req = {
            testId: this.selectedTestId(),
            employeId: emp.id,
            dateLimite: this.testDueDate() ? new Date(this.testDueDate()).toISOString() : undefined
        };

        this.managerService.assignTest(req).subscribe({
            next: () => {
                this.submitting.set(false);
                this.showTestModal.set(false);
                this.resetForms();
                alert("Assignation réussie. L'employé a été alerté.");
            },
            error: (err) => {
                console.error("Test assign error:", err);
                this.submitting.set(false);
                alert("Échec de l'assignation. Ce test est peut-être déjà en cours.");
            }
        });
    }
}
