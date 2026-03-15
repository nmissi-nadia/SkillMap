import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TestExecutionService } from '../services/test-execution.service';
import { AuthService } from '../../../core/services/auth.service';
import { TestEmploye } from '../models/test.model';

@Component({
    selector: 'app-employe-tests',
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
    <div class="employe-tests-container">
      <div class="header">
        <h1>Mes Tests Techniques</h1>
      </div>

      <mat-card>
        <table mat-table [dataSource]="assignedTests()" class="mat-elevation-z0">
          <ng-container matColumnDef="titre">
            <th mat-header-cell *matHeaderCellDef> Test </th>
            <td mat-cell *matCellDef="let te"> {{te.test?.titre}} </td>
          </ng-container>

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef> Statut </th>
            <td mat-cell *matCellDef="let te"> 
              <span class="status-badge" [ngClass]="te.statut.toLowerCase()">
                {{te.statut}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="score">
            <th mat-header-cell *matHeaderCellDef> Score </th>
            <td mat-cell *matCellDef="let te"> 
              {{te.score !== null ? te.score + '%' : '-'}}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let te">
              <button mat-flat-button color="primary" *ngIf="te.statut !== 'COMPLETED'" [routerLink]="['/employe/tests', te.id, 'pass']">
                {{ te.statut === 'ASSIGNED' ? 'Démarrer' : 'Continuer' }}
              </button>
              <button mat-stroked-button color="accent" *ngIf="te.statut === 'COMPLETED'" [routerLink]="['/employe/tests', te.id, 'result']">
                Résultat
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="assignedTests().length === 0" class="empty-state">
           <p>Vous n'avez aucun test technique assigné pour le moment.</p>
        </div>
      </mat-card>
    </div>
  `,
    styles: [`
    .employe-tests-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 2rem;
    }
    .header h1 {
      color: var(--primary);
    }
    table { width: 100%; }
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    .assigned { background: #E3F2FD; color: #1976D2; }
    .in_progress { background: #FEF3C7; color: #D97706; }
    .completed { background: #D1FAE5; color: #059669; }
    .empty-state { padding: 3rem; text-align: center; color: var(--text-secondary); }
  `]
})
export class EmployeTestsComponent implements OnInit {
    private executionService = inject(TestExecutionService);
    private authService = inject(AuthService);

    assignedTests = signal<TestEmploye[]>([]);
    displayedColumns: string[] = ['titre', 'statut', 'score', 'actions'];

    ngOnInit(): void {
        const user = this.authService.currentUser();
        if (user?.id) {
            this.executionService.getEmployeTests(user.id).subscribe(data => this.assignedTests.set(data));
        }
    }
}
