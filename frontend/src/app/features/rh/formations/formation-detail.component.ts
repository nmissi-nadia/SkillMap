import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RhService, FormationDTO, FormationBudgetDTO, EmployeFormationStatusDTO } from '../../../core/services/rh.service';
import { FormationService } from '../../../core/services/formation.service';
import { FormationDetailDTO, RessourceFormationDTO, TypeRessource } from '../../../core/models/formation.model';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-formation-detail-rh',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatSnackBarModule, DecimalPipe, CurrencyPipe, DatePipe],
  templateUrl: './formation-detail.component.html',
  styleUrl: './formation-detail.component.scss'
})
export class FormationDetailRHComponent implements OnInit {
  formationId = signal<string | null>(null);
  formation = signal<FormationDetailDTO | null>(null);
  budget = signal<FormationBudgetDTO | null>(null);
  
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  // UI Tabs
  activeTab = signal<'overview' | 'participants' | 'resources'>('overview');
  
  // Resource Form
  showResourceModal = signal(false);
  newResource = { titre: '', url: '', typeRessource: TypeRessource.LIEN };
  isAddingResource = signal(false);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rhService = inject(RhService);
  private formationService = inject(FormationService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.formationId.set(id);
      this.loadAllData();
    } else {
      this.error.set('Identifiant de formation manquant');
      this.isLoading.set(false);
    }
  }

  loadAllData(): void {
    const id = this.formationId();
    if (!id) return;

    this.isLoading.set(true);
    
    // Charger les détails de base
    this.formationService.getFormationById(id).subscribe({
      next: (data) => {
        this.formation.set(data);
        this.loadBudgetData();
      },
      error: (err) => {
        console.error('Erreur chargement formation:', err);
        this.error.set('Impossible de charger les détails de la formation');
        this.isLoading.set(false);
      }
    });
  }

  loadBudgetData(): void {
    const id = this.formationId();
    if (!id) return;

    this.rhService.getFormationBudget(id).subscribe({
      next: (data) => {
        this.budget.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur budget:', err);
        // On ne bloque pas tout pour le budget
        this.isLoading.set(false);
      }
    });
  }

  setTab(tab: 'overview' | 'participants' | 'resources'): void {
    this.activeTab.set(tab);
  }

  getStatutColor(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('TERMINE')) return '#10b981';
    if (s.includes('COURS')) return '#3b82f6';
    if (s.includes('INSC')) return '#6366f1';
    return '#94a3b8';
  }

  openResourceModal(): void {
    this.newResource = { titre: '', url: '', typeRessource: TypeRessource.LIEN };
    this.showResourceModal.set(true);
  }

  closeResourceModal(): void {
    this.showResourceModal.set(false);
  }

  addResource(): void {
    if (!this.newResource.titre || !this.newResource.url) {
      this.snackBar.open('Veuillez remplir tous les champs', 'OK', { duration: 3000 });
      return;
    }

    const id = this.formationId();
    if (!id) return;

    this.isAddingResource.set(true);
    this.formationService.addResourceToFormation(id, this.newResource).subscribe({
      next: () => {
        this.snackBar.open('Ressource ajoutée avec succès', 'OK', { duration: 3000 });
        this.isAddingResource.set(false);
        this.closeResourceModal();
        this.loadAllData();
      },
      error: (err) => {
        console.error(err);
        this.isAddingResource.set(false);
        this.snackBar.open('Erreur lors de l\'ajout de la ressource', 'Fermer', { duration: 3000 });
      }
    });
  }

  validateCertification(employeId: string): void {
    const fId = this.formationId();
    if (!fId) return;

    if (confirm('Voulez-vous valider officiellement la certification pour cet employé ?')) {
      this.rhService.validateCertification({
        employeId,
        formationId: fId,
        certification: this.formation()?.titre || 'Certification',
        valide: true
      }).subscribe({
        next: () => {
          this.snackBar.open('Certification validée !', 'OK', { duration: 3000 });
          this.loadAllData();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erreur lors de la validation', 'Fermer');
        }
      });
    }
  }

  getAverageProgress(): number {
    const b = this.budget();
    if (!b || !b.tauxCompletion) return 0;
    return b.tauxCompletion;
  }

  goBack(): void {
    this.router.navigate(['/rh/formations']);
  }
}
