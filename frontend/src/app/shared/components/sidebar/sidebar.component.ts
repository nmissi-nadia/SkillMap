import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ManagerService } from '../../../core/services/manager.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" *ngIf="authService.isAuthenticated()">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🚀</span>
          <span class="logo-text">SkillMap</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <!-- Menu Employé -->
        <ul *ngIf="isEmployee()">
          <li class="menu-label">MENU EMPLOYÉ</li>
          <li>
            <a routerLink="/employee/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="nav-icon">🏠</span>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/employee/profile" routerLinkActive="active">
              <span class="nav-icon">👤</span>
              <span class="nav-text">Mon Profil</span>
            </a>
          </li>
          <li>
            <a routerLink="/employee/competencies" routerLinkActive="active">
              <span class="nav-icon">🎯</span>
              <span class="nav-text">Compétences</span>
            </a>
          </li>
          <li>
            <a routerLink="/employee/tests" routerLinkActive="active">
              <span class="nav-icon">📝</span>
              <span class="nav-text">Tests Techniques</span>
            </a>
          </li>
          <li>
            <a routerLink="/employee/formations" routerLinkActive="active">
              <span class="nav-icon">📚</span>
              <span class="nav-text">Formations</span>
            </a>
          </li>
        </ul>

        <!-- Menu Manager -->
        <ul *ngIf="isManager()">
          <li class="menu-label">MENU MANAGER</li>
          <li>
            <a routerLink="/manager/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="nav-icon">📊</span>
              <span class="nav-text">Dashboard Team</span>
            </a>
          </li>
          <li>
            <a routerLink="/manager/team" routerLinkActive="active">
              <span class="nav-icon">👥</span>
              <span class="nav-text">Mon Équipe</span>
            </a>
          </li>
          <li>
            <a routerLink="/manager/evaluations" routerLinkActive="active" class="has-badge">
              <span class="nav-icon">⭐</span>
              <span class="nav-text">Évaluations</span>
              <span class="badge-notification" *ngIf="pendingEvaluationsCount() > 0">{{ pendingEvaluationsCount() }}</span>
            </a>
          </li>
          <li>
            <a routerLink="/manager/tests" routerLinkActive="active">
              <span class="nav-icon">📝</span>
              <span class="nav-text">Tests Techniques</span>
            </a>
          </li>
          <li>
            <a routerLink="/manager/projects" routerLinkActive="active">
              <span class="nav-icon">🚀</span>
              <span class="nav-text">Projets</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" *ngIf="user()">
          <div class="user-avatar">{{ user()?.prenom?.[0] }}{{ user()?.nom?.[0] }}</div>
          <div class="user-details">
            <span class="user-name">{{ user()?.prenom }} {{ user()?.nom }}</span>
            <span class="user-role">{{ user()?.role }}</span>
          </div>
        </div>
        <button class="btn-logout" (click)="logout()">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">Déconnexion</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }

    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      transition: all 0.3s ease;
      z-index: 100;
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 0 0.75rem;
      overflow-y: auto;
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .menu-label {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-tertiary);
      letter-spacing: 0.05em;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: var(--text-secondary);
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .sidebar-nav a:hover {
      background: var(--surface-hover);
      color: var(--text-primary);
    }

    .sidebar-nav a.active {
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--primary);
    }

    .nav-icon {
      font-size: 1.25rem;
    }

    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      color: var(--error);
      cursor: pointer;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .has-badge {
      position: relative;
    }

    .badge-notification {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 80px;
      }
      .nav-text, .logo-text, .menu-label, .user-details {
        display: none;
      }
      .sidebar-header, .sidebar-nav a, .btn-logout, .user-info {
        justify-content: center;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  public authService = inject(AuthService);
  private managerService = inject(ManagerService);
  protected user = this.authService.currentUser;
  pendingEvaluationsCount = signal<number>(0);

  ngOnInit() {
    if (this.isManager()) {
      this.loadPendingEvaluationsCount();
    }
  }

  loadPendingEvaluationsCount() {
    this.managerService.getPendingEvaluations().subscribe({
      next: (evaluations) => {
        this.pendingEvaluationsCount.set(evaluations.length);
      },
      error: () => {
        this.pendingEvaluationsCount.set(0);
      }
    });
  }

  isEmployee(): boolean {
    return this.authService.hasRole('EMPLOYE');
  }

  isManager(): boolean {
    return this.authService.hasRole('MANAGER');
  }

  logout() {
    this.authService.logout();
  }
}
