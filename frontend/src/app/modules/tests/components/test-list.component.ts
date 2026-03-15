import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TestService } from '../services/test.service';
import { TestTechnique } from '../models/test.model';

@Component({
    selector: 'app-test-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule
    ],
    template: `
    <div class="test-list-container">
      <div class="header">
        <h1>Gestion des Tests Techniques</h1>
        <button mat-raised-button color="primary" routerLink="/tests/create">
          <mat-icon>add</mat-icon> Nouveau Test
        </button>
      </div>

      <mat-card>
        <table mat-table [dataSource]="tests()" class="mat-elevation-z0">
          <ng-container matColumnDef="titre">
            <th mat-header-cell *matHeaderCellDef> Titre </th>
            <td mat-cell *matCellDef="let test"> {{test.titre}} </td>
          </ng-container>

          <ng-container matColumnDef="niveau">
            <th mat-header-cell *matHeaderCellDef> Niveau </th>
            <td mat-cell *matCellDef="let test"> 
              <mat-chip-set>
                <mat-chip>{{test.niveau}}</mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="duree">
            <th mat-header-cell *matHeaderCellDef> Durée </th>
            <td mat-cell *matCellDef="let test"> {{test.dureeMinutes}} min </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let test">
              <button mat-icon-button color="accent" [routerLink]="['/tests', test.id]">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="primary" [routerLink]="['/tests/assign', test.id]">
                <mat-icon>person_add</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="tests().length === 0" class="empty-state">
           <p>Aucun test technique disponible.</p>
        </div>
      </mat-card>
    </div>
  `,
    styles: [`
    .test-list-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header h1 {
      margin: 0;
      color: var(--primary);
    }
    table {
      width: 100%;
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-secondary);
    }
  `]
})
export class TestListComponent implements OnInit {
    private testService = inject(TestService);

    tests = signal<TestTechnique[]>([]);
    displayedColumns: string[] = ['titre', 'niveau', 'duree', 'actions'];

    ngOnInit(): void {
        this.loadTests();
    }

    loadTests(): void {
        this.testService.getAllTests().subscribe({
            next: (data) => this.tests.set(data),
            error: (err) => console.error('Error loading tests', err)
        });
    }
}
