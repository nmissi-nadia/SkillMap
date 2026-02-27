import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { FormationDTO } from '../../../core/services/rh.service';

@Component({
  selector: 'app-employee-formations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.scss']
})
export class FormationsComponent implements OnInit {
  private employeeService = inject(EmployeeService);

  formations = signal<FormationDTO[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtres
  selectedType = signal<string>('all');
  searchQuery = signal<string>('');

  ngOnInit() {
    this.loadFormations();
  }

  loadFormations() {
    this.loading.set(true);
    this.employeeService.getMyFormations().subscribe({
      next: (data: any) => {
        // Si c'est une PageResponse, on prend le contenu
        this.formations.set(data.content || data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement formations:', err);
        this.error.set('Impossible de charger les formations.');
        this.loading.set(false);
      }
    });
  }

  getFilteredFormations() {
    return this.formations().filter(f => {
      const matchType = this.selectedType() === 'all' || f.type === this.selectedType();
      const matchSearch = f.titre.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                         f.organisme?.toLowerCase().includes(this.searchQuery().toLowerCase());
      return matchType && matchSearch;
    });
  }

  register(formation: FormationDTO) {
    if (confirm(`Voulez-vous vous inscrire à la formation "${formation.titre}" ?`)) {
      this.employeeService.registerToFormation(formation.id).subscribe({
        next: () => {
          alert('Inscription réussie !');
          this.loadFormations();
        },
        error: (err) => {
          console.error('Erreur inscription:', err);
          alert('Erreur lors de l\'inscription.');
        }
      });
    }
  }

  getStatusLabel(status: string) {
    const labels: any = {
      'PLANIFIEE': 'À venir',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée'
    };
    return labels[status] || status;
  }
}
