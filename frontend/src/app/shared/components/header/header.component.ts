import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationBellComponent],
  template: `
    <header class="app-header" *ngIf="authService.isAuthenticated()">
      <div class="header-left">
        <h2 class="page-title">{{ getPageTitle() }}</h2>
      </div>
      
      <div class="header-right">
        <app-notification-bell></app-notification-bell>
        
        <div class="user-profile" *ngIf="user()">
          <div class="user-info">
            <span class="user-name">{{ user()?.prenom }} {{ user()?.nom }}</span>
            <span class="user-role">{{ getRoleLabel(user()?.role) }}</span>
          </div>
          <div class="user-avatar">{{ user()?.prenom?.[0] }}{{ user()?.nom?.[0] }}</div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: 70px;
      padding: 0 2rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-left .page-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-left: 1.5rem;
      border-left: 1px solid var(--border-light);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
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
      font-weight: 700;
      font-size: 0.875rem;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }

    @media (max-width: 768px) {
      .user-info {
        display: none;
      }
      .app-header {
        padding: 0 1rem;
      }
    }
  `]
})
export class HeaderComponent {
  public authService = inject(AuthService);
  protected user = this.authService.currentUser;

  getPageTitle(): string {
    // On pourrait injecter le routeur pour avoir un titre dynamique
    return 'SkillMap Dashboard';
  }

  getRoleLabel(role: string | undefined): string {
    switch (role) {
      case 'EMPLOYE': return 'Employé';
      case 'MANAGER': return 'Manager';
      case 'RH': return 'Ressources Humaines';
      case 'CHEF_PROJET': return 'Chef de Projet';
      default: return role || '';
    }
  }
}
