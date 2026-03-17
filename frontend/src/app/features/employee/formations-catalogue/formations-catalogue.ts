import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormationDetailDTO } from '../../../core/models/formation.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-formations-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './formations-catalogue.html',
  styleUrl: './formations-catalogue.scss',
})
export class FormationsCatalogue implements OnInit {
  formations: FormationDetailDTO[] = [];
  filteredFormations: FormationDetailDTO[] = [];
  currentUserId: string = '';
  searchTerm = '';
  activeType: string = 'ALL';
  loading = true;
  enrolling: Record<string, boolean> = {};

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) this.currentUserId = user.id;
    this.loadCatalogue();
  }

  loadCatalogue(): void {
    this.loading = true;
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        // Formations où l'employé n'est pas encore inscrit
        this.formations = data.filter(f =>
          !f.inscriptions?.some((i: any) => i.employeId === this.currentUserId)
        );
        this.filteredFormations = [...this.formations];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement catalogue', err);
        this.loading = false;
      }
    });
  }

  filterFormations(): void {
    this.filteredFormations = this.formations.filter(f => {
      const matchSearch = !this.searchTerm ||
        f.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (f.description || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (f.competenceNom || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = this.activeType === 'ALL' || f.typeFormation === this.activeType;
      return matchSearch && matchType;
    });
  }

  setTypeFilter(type: string): void {
    this.activeType = type;
    this.filterFormations();
  }

  countByType(type: string): number {
    return this.formations.filter(f => f.typeFormation === type).length;
  }

  getAccentClass(type: string): string {
    const map: Record<string, string> = { PRESENTIEL: 'presentiel', LIEN: 'lien', PDF: 'pdf' };
    return map[type] || 'default';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = { PRESENTIEL: 'Présentiel', LIEN: 'En ligne', PDF: 'Document PDF' };
    return map[type] || type;
  }

  getIconForType(type: string): string {
    const map: Record<string, string> = { PRESENTIEL: 'school', LIEN: 'laptop_mac', PDF: 'description' };
    return map[type] || 'menu_book';
  }

  inscrire(formation: FormationDetailDTO): void {
    this.sinscrire(formation.id);
  }

  isInscrit(formationId: string): boolean {
    return this.enrolling[formationId] || false;
  }

  findCompetenceName(id: string | undefined): string {
    if (!id) return 'Compétence';
    const f = this.formations.find(x => x.competenceId === id);
    return f ? (f.competenceNom || 'Compétence') : 'Compétence';
  }

  sinscrire(formationId: string): void {
    if (!this.currentUserId) return;
    this.enrolling[formationId] = true;

    this.formationService.assignFormationToEmployee(formationId, this.currentUserId).subscribe({
      next: () => {
        this.snackBar.open('✨ Inscription réussie ! Retrouvez la formation dans Mes Formations.', 'OK', { duration: 4000 });
        this.loadCatalogue();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Erreur lors de l\'inscription.', 'Fermer', { duration: 3000 });
        this.enrolling[formationId] = false;
      }
    });
  }
}
