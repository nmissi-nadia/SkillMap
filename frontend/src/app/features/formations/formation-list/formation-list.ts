import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../core/services/formation.service';
import { FormationDetailDTO } from '../../../core/models/formation.model';
import { MetadataService, MetadataOption } from '../../../core/services/metadata.service';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './formation-list.html',
  styleUrl: './formation-list.scss',
})
export class FormationList implements OnInit {
  formations: FormationDetailDTO[] = [];
  filteredFormations: FormationDetailDTO[] = [];
  searchTerm = '';
  activeFilter = '';
  loading = true;

  // Metadata
  formationTypes = signal<MetadataOption[]>([]);

  constructor(private formationService: FormationService, private router: Router, private metadataService: MetadataService) { }

  ngOnInit(): void {
    this.loadMetadata();
    this.loadFormations();
  }

  loadMetadata(): void {
    this.metadataService.getMetadata().subscribe(meta => {
      this.formationTypes.set(meta.formationTypes);
    });
  }

  loadFormations(): void {
    this.loading = true;
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        this.formations = data;
        this.filteredFormations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement formations', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredFormations = this.formations.filter(f => {
      const matchesSearch = !this.searchTerm ||
        f.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (f.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.activeFilter || f.typeFormation === this.activeFilter;
      return matchesSearch && matchesType;
    });
  }

  filterByType(type: string): void {
    this.activeFilter = type;
    this.applyFilter();
  }

  countByType(type: string): number {
    return this.formations.filter(f => f.typeFormation === type).length;
  }

  getBannerClass(type: string): string {
    const map: Record<string, string> = {
      PRESENTIEL: 'presentiel',
      LIEN: 'lien',
      PDF: 'pdf'
    };
    return map[type] || 'default';
  }

  getTypeLabel(type: string): string {
    return this.metadataService.getLabel(this.formationTypes(), type);
  }

  getTypeEmoji(type: string): string {
    const map: Record<string, string> = {
      PRESENTIEL: '🏫',
      LIEN: '🌐',
      PDF: '📄'
    };
    return map[type] || '🎓';
  }

  goToDetail(id: string): void {
    this.router.navigate(['/formations', id]);
  }
}
