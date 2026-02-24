import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    // Manager routes
    {
        path: 'manager/dashboard',
        loadComponent: () => import('./features/manager/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'manager/team',
        loadComponent: () => import('./features/manager/team/team-list.component').then(m => m.TeamListComponent),
        canActivate: [authGuard]
    },
    {
        path: 'manager/evaluations',
        loadComponent: () => import('./features/manager/evaluations/pending-evaluations.component').then(m => m.PendingEvaluationsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'manager',
        redirectTo: 'manager/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'rh/dashboard',
        loadComponent: () => import('./features/rh/dashboard/dashboard.component').then(m => m.RhDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rh/users',
        loadComponent: () => import('./features/rh/user-management/user-management.component').then(m => m.UserManagementComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rh/skills-map',
        loadComponent: () => import('./features/rh/skills-map/skills-map.component').then(m => m.SkillsMapComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rh/formations',
        loadComponent: () => import('./features/rh/formations/formations.component').then(m => m.FormationsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rh',
        redirectTo: 'rh/dashboard',
        pathMatch: 'full'
    },
    // Employee routes
    {
        path: 'employee/dashboard',
        loadComponent: () => import('./features/employee/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'employee/profile',
        loadComponent: () => import('./features/employee/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'employee/competencies',
        loadComponent: () => import('./features/employee/competencies/competencies.component').then(m => m.CompetenciesComponent),
        canActivate: [authGuard]
    },
    // Chef de Projet routes
    {
        path: 'chef-projet/dashboard',
        loadComponent: () => import('./features/chef-projet/dashboard/dashboard.component').then(m => m.ChefProjetDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet/projets',
        loadComponent: () => import('./features/chef-projet/projets/projets.component').then(m => m.ProjetsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet/matching',
        loadComponent: () => import('./features/chef-projet/matching/matching.component').then(m => m.MatchingComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet/equipe',
        loadComponent: () => import('./features/chef-projet/equipe/equipe.component').then(m => m.EquipeComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet/messagerie',
        loadComponent: () => import('./features/chef-projet/messagerie/messagerie.component').then(m => m.MessagerieComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet',
        redirectTo: 'chef-projet/dashboard',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];
