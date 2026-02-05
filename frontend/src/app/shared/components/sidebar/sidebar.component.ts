import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ManagerService } from '../../../core/services/manager.service';
import { RhService } from '../../../core/services/rh.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" *ngIf="authService.isAuthenticated()">
      <!-- Header with Logo -->
      <div class="sidebar-header">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">SkillMap</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <!-- Menu Employé -->
        <ul *ngIf="isEmployee()">
          <li class="menu-label">ESPACE EMPLOYÉ</li>
          <li>
            <a routerLink="/employee/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/employee/profile" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Mon Profil</span>
            </a>
          </li>
          <li>
            <a routerLink="/employee/competencies" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Compétences</span>
            </a>
          </li>
          <li>
            <a routerLink="/employee/tests" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Tests Techniques</span>
            </a>
          </li>
          <li>
            <a routerLink="/employee/formations" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Formations</span>
            </a>
          </li>
        </ul>

        <!-- Menu Manager -->
        <ul *ngIf="isManager()">
          <li class="menu-label">ESPACE MANAGER</li>
          <li>
            <a routerLink="/manager/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/manager/team" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Mon Équipe</span>
            </a>
          </li>
          <li>
            <a routerLink="/manager/evaluations" routerLinkActive="active" class="has-badge">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Évaluations</span>
              <span class="badge-notification" *ngIf="pendingEvaluationsCount() > 0">{{ pendingEvaluationsCount() }}</span>
            </a>
          </li>
          <li>
            <a routerLink="/manager/tests" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Tests</span>
            </a>
          </li>
          <li>
            <a routerLink="/manager/projects" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Projets</span>
            </a>
          </li>
        </ul>

        <!-- Menu RH -->
        <ul *ngIf="isRH()">
          <li class="menu-label">ESPACE RH</li>
          <li>
            <a routerLink="/rh/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/rh/users" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Utilisateurs</span>
            </a>
          </li>
          <li>
            <a routerLink="/rh/skills-map" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Compétences</span>
            </a>
          </li>
          <li>
            <a routerLink="/rh/formations" routerLinkActive="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="nav-text">Formations</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Footer with User Info -->
      <div class="sidebar-footer">
        <div class="user-info" *ngIf="user()">
          <div class="user-avatar">{{ user()?.prenom?.[0] }}{{ user()?.nom?.[0] }}</div>
          <div class="user-details">
            <span class="user-name">{{ user()?.prenom }} {{ user()?.nom }}</span>
            <span class="user-role">{{ getRoleLabel(user()?.role) }}</span>
          </div>
        </div>
        <button class="btn-logout" (click)="logout()">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
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
      width: 280px;
      height: 100vh;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.03);
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      color: #3b82f6;
      filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2));
    }

    .logo-text {
      font-size: 1.375rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.03em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 0.875rem;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .menu-label {
      padding: 0.625rem 1rem;
      font-size: 0.6875rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      text-decoration: none;
      color: #475569;
      border-radius: 0.625rem;
      font-weight: 500;
      font-size: 0.9375rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .sidebar-nav a::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 3px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      transform: scaleY(0);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-nav a:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
      color: #1e293b;
      transform: translateX(2px);
    }

    .sidebar-nav a.active {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
      color: #3b82f6;
      font-weight: 600;
    }

    .sidebar-nav a.active::before {
      transform: scaleY(1);
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      stroke-width: 2;
    }

    .sidebar-footer {
      padding: 1rem 0.875rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      background: linear-gradient(180deg, transparent 0%, rgba(248, 250, 252, 0.8) 100%);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.625rem 0.875rem;
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .user-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      letter-spacing: 0.02em;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }

    .user-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }

    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      background: transparent;
      border: 1px solid #fee2e2;
      color: #dc2626;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.9375rem;
      font-weight: 600;
      border-radius: 0.625rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-logout:hover {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%);
      border-color: #fecaca;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
    }

    .btn-logout:active {
      transform: translateY(0);
    }

    .has-badge {
      position: relative;
    }

    .badge-notification {
      position: absolute;
      top: 0.625rem;
      right: 0.625rem;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      min-width: 20px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(239, 68, 68, 0.5);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      border: 2px solid white;
    }

    @keyframes pulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 1;
      }
      50% { 
        transform: scale(1.05);
        opacity: 0.9;
      }
    }

    @media (max-width: 1024px) {
      .sidebar {
        width: 240px;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 72px;
      }
      
      .nav-text, .logo-text, .menu-label, .user-details {
        display: none;
      }
      
      .sidebar-header {
        padding: 1.5rem 0.75rem;
        justify-content: center;
      }
      
      .logo {
        justify-content: center;
      }
      
      .sidebar-nav a {
        justify-content: center;
        padding: 0.875rem;
      }
      
      .btn-logout {
        justify-content: center;
        padding: 0.875rem;
      }
      
      .user-info {
        justify-content: center;
        padding: 0.625rem;
      }
      
      .badge-notification {
        right: 0.25rem;
        top: 0.25rem;
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

  isRH(): boolean {
    return this.authService.hasRole('RH');
  }

  getRoleLabel(role: string | undefined): string {
    switch (role) {
      case 'EMPLOYE': return 'Employé';
      case 'MANAGER': return 'Manager';
      case 'RH': return 'Ressources Humaines';
      default: return role || '';
    }
  }

  logout() {
    this.authService.logout();
  }
}
