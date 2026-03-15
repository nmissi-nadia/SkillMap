import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../../core/services/formation.service';
import { FormationDetailDTO } from '../../../core/models/formation.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule],
  templateUrl: './formation-list.html',
  styleUrl: './formation-list.scss',
})
export class FormationList implements OnInit {
  formations: FormationDetailDTO[] = [];
  displayedColumns: string[] = ['titre', 'type', 'competence', 'dates', 'participants', 'actions'];

  constructor(private formationService: FormationService) { }

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        this.formations = data;
      },
      error: (err) => console.error('Erreur chargement formations', err)
    });
  }
}
