import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    exact?: boolean;
}

@Component({
    selector: 'app-chef-projet-layout',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './chef-projet-layout.component.html',
    styleUrls: ['./chef-projet-layout.component.scss']
})
export class ChefProjetLayoutComponent {

    sidebarCollapsed = signal(false);

    readonly navItems: NavItem[] = [
        { label: 'Tableau de bord', icon: 'dashboard', route: '/chef-projet/dashboard', exact: true },
        { label: 'Mes projets', icon: 'projects', route: '/chef-projet/projets' },
        { label: 'Matching', icon: 'matching', route: '/chef-projet/matching' },
        { label: 'Équipe', icon: 'team', route: '/chef-projet/equipe' },
        { label: 'Messagerie', icon: 'messages', route: '/chef-projet/messagerie' }
    ];

    currentUser = computed(() => this.authService.currentUser());

    constructor(private authService: AuthService) { }

    toggleSidebar() { this.sidebarCollapsed.update(v => !v); }

    logout() { this.authService.logout(); }

    getIconPath(icon: string): string {
        const icons: Record<string, string> = {
            dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
            projects: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
            matching: 'M11 11.5v-1a1.5 1.5 0 0 1 3 0v1m0 0v3.5a2.5 2.5 0 0 1-5 0V11.5m5 0H9 M10 2a8 8 0 1 0 8 8',
            team: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
            messages: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'
        };
        return icons[icon] ?? '';
    }
}
