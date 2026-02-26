import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RhService, CompetenceDTO } from '../../../core/services/rh.service';

@Component({
  selector: 'app-competencies-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './competencies-management.component.html',
  styleUrl: './competencies-management.component.css'
})
export class CompetenciesManagementComponent implements OnInit {
  private rhService = inject(RhService);

  // States
  competencies = signal<CompetenceDTO[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  // Search & Filters
  searchTerm = signal('');
  selectedType = signal<string>('');

  // Modal State
  isModalOpen = signal(false);
  isEditMode = signal(false);
  editingCompetence = signal<CompetenceDTO>({
    nom: '',
    type: 'HARD',
    description: ''
  });

  // Computed filtered list
  filteredCompetencies = computed(() => {
    let list = this.competencies();
    const search = this.searchTerm().toLowerCase();
    const type = this.selectedType();

    if (search) {
      list = list.filter(c => c.nom.toLowerCase().includes(search) || (c.description?.toLowerCase().includes(search)));
    }

    if (type) {
      list = list.filter(c => c.type === type);
    }

    return list;
  });

  ngOnInit() {
    this.loadCompetencies();
  }

  loadCompetencies() {
    this.isLoading.set(true);
    this.rhService.getCompetencies().subscribe({
      next: (data) => {
        this.competencies.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set("Erreur lors du chargement des compétences");
        this.isLoading.set(false);
      }
    });
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.editingCompetence.set({
      nom: '',
      type: 'HARD',
      description: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(comp: CompetenceDTO) {
    this.isEditMode.set(true);
    this.editingCompetence.set({ ...comp });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveCompetence() {
    const comp = this.editingCompetence();
    if (!comp.nom) return;

    if (this.isEditMode() && comp.id) {
      this.rhService.updateCompetence(comp.id, comp).subscribe({
        next: () => {
          this.loadCompetencies();
          this.closeModal();
        },
        error: () => this.error.set("Erreur lors de la mise à jour")
      });
    } else {
      this.rhService.createCompetence(comp).subscribe({
        next: () => {
          this.loadCompetencies();
          this.closeModal();
        },
        error: () => this.error.set("Erreur lors de la création")
      });
    }
  }

  deleteCompetence(id: string | undefined) {
    if (!id || !confirm("Êtes-vous sûr de vouloir supprimer cette compétence ?")) return;

    this.rhService.deleteCompetence(id).subscribe({
      next: () => this.loadCompetencies(),
      error: () => this.error.set("Erreur lors de la suppression")
    });
  }
}
