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
        path: 'manager',
        redirectTo: 'manager/dashboard',
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
    {
        path: '**',
        redirectTo: '/login'
    }
];
