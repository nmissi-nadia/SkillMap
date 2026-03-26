
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService, AuditLog } from '../../../core/services/audit.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-container p-6">
      <div class="header mb-8">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">Logs d'Audit</h1>
        <p class="text-slate-500">Traçabilité complète des actions effectuées sur la plateforme</p>
      </div>

      <!-- Filters & Tools -->
      <div class="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div class="flex gap-4">
          <div class="search-box relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input type="text" placeholder="Rechercher une action..." 
                   class="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-blue-500/50 w-64 shadow-sm">
          </div>
          <select class="bg-white border border-slate-200 rounded-xl py-2 px-4 text-slate-900 focus:outline-none shadow-sm">
            <option value="">Toutes les entités</option>
            <option value="USER">Utilisateurs</option>
            <option value="TEST">Tests</option>
            <option value="FORMATION">Formations</option>
            <option value="COMPETENCE">Compétences</option>
          </select>
        </div>
        
        <button (click)="loadLogs()" class="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400" title="Rafraîchir">
          🔄
        </button>
      </div>

      <!-- Table Card -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entité</th>
                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Détails</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr class="animate-pulse">
                    <td class="p-4"><div class="h-4 w-32 bg-white/10 rounded"></div></td>
                    <td class="p-4"><div class="h-4 w-24 bg-white/10 rounded"></div></td>
                    <td class="p-4"><div class="h-4 w-40 bg-white/10 rounded"></div></td>
                    <td class="p-4"><div class="h-4 w-20 bg-white/10 rounded"></div></td>
                    <td class="p-4"><div class="h-4 w-full bg-white/10 rounded"></div></td>
                  </tr>
                }
              } @else {
                @for (log of logs(); track log.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors group">
                    <td class="p-4">
                      <div class="text-sm text-slate-900 font-medium">{{ log.dateAction | date:'dd/MM/yyyy' }}</div>
                      <div class="text-[10px] text-slate-400">{{ log.dateAction | date:'HH:mm:ss' }}</div>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-200">
                          {{ log.utilisateurId.substring(0, 2) | uppercase }}
                        </div>
                        <span class="text-sm text-slate-600 font-mono text-[11px]">{{ log.utilisateurId }}</span>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="px-2 py-1 rounded-md text-[10px] font-bold font-mono"
                            [ngClass]="getActionClass(log.action)">
                        {{ log.action }}
                      </span>
                    </td>
                    <td class="p-4 text-sm text-gray-400 font-medium">
                      {{ log.entite }}
                    </td>
                    <td class="p-4">
                      <div class="max-w-md truncate text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-help" 
                           [title]="getFormatedDetail(log)">
                        {{ log.nouvelEtat || 'N/A' }}
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 bg-slate-50/50">
          <div>
            Affichage de <b class="text-slate-900">{{ logs().length }}</b> sur <b class="text-slate-900">{{ totalElements() }}</b> logs
          </div>
          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="page() === 0" 
                    class="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors shadow-sm">
              Précédent
            </button>
            <span class="flex items-center px-4 font-medium">Page {{ page() + 1 }} sur {{ totalPages() }}</span>
            <button (click)="nextPage()" [disabled]="page() === totalPages() - 1"
                    class="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors shadow-sm">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-container { min-height: calc(100vh - 80px); }
  `]
})
export class AuditLogsComponent implements OnInit {
  private auditService = inject(AuditService);

  logs = signal<AuditLog[]>([]);
  loading = signal(true);
  page = signal(0);
  size = signal(15);
  totalElements = signal(0);
  totalPages = signal(0);

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading.set(true);
    this.auditService.getLogs(this.page(), this.size()).subscribe({
      next: (resp) => {
        this.logs.set(resp.content);
        this.totalElements.set(resp.totalElements);
        this.totalPages.set(resp.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Audit Error:', err);
        this.loading.set(false);
      }
    });
  }

  nextPage() {
    if (this.page() < this.totalPages() - 1) {
      this.page.update(p => p + 1);
      this.loadLogs();
    }
  }

  prevPage() {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
      this.loadLogs();
    }
  }

  getActionClass(action: string): string {
    if (action.includes('SUCCESS') || action.includes('VALIDATION')) return 'bg-green-500/10 text-green-500 border border-green-500/30';
    if (action.includes('FAILURE') || action.includes('DELETE')) return 'bg-red-500/10 text-red-500 border border-red-500/30';
    if (action.includes('UPDATE')) return 'bg-blue-500/10 text-blue-500 border border-blue-500/30';
    return 'bg-gray-500/10 text-gray-500 border border-gray-500/30';
  }

  getFormatedDetail(log: AuditLog): string {
    return `Ancien: ${log.ancienEtat || 'N/A'}\nNouveau: ${log.nouvelEtat || 'N/A'}`;
  }
}
